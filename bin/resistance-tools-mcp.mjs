#!/usr/bin/env node
import { mkdir, readFile, rename, rm, writeFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const remoteUrl = process.env.RESISTANCE_TOOLS_MCP_URL ?? "https://app.resistance.dog/api/mcp";
const remote = new URL(remoteUrl);
const issuer = process.env.RESISTANCE_TOOLS_OAUTH_ISSUER ?? remote.origin;
const resource = process.env.RESISTANCE_TOOLS_MCP_RESOURCE ?? remote.href.replace(/\/$/, "");
const configuredClientId = process.env.RESISTANCE_TOOLS_MCP_CLIENT_ID?.trim() || null;
const tokenStorePath = process.env.RESISTANCE_TOOLS_MCP_TOKEN_STORE ?? join(homedir(), ".resistance-tools-mcp", "auth.json");
const deviceGrantType = "urn:ietf:params:oauth:grant-type:device_code";
const tonProofGrantType = "urn:resistance:params:oauth:grant-type:ton-proof";
const defaultScopes = ["wallet:read", "sites:read", "deployments:read", "dns:read", "storage:read"];
const allowedScopes = new Set([
  "wallet:read",
  "sites:read",
  "sites:write",
  "sites:rollback",
  "sites:delete",
  "deployments:read",
  "dns:read",
  "dns:prepare_tx",
  "storage:read",
  "storage:write",
  "storage:delete",
  "mcp:read",
  "mcp:revoke",
]);

let remoteClientPromise;
let remoteTransport;
let refreshPromise;

function now() {
  return Date.now();
}

function jsonTool(data, isError = false) {
  return {
    isError,
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function normalizeStringArray(value, field) {
  if (value === undefined || value === null || value === "") return null;
  const raw = Array.isArray(value) ? value : String(value).split(/[\s,]+/);
  const items = [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
  if (items.some((item) => item.length > 256)) throw new Error(`${field} contains an invalid value`);
  return items.length ? items : null;
}

function normalizeScopes(value) {
  const scopes = normalizeStringArray(value, "scopes") ?? defaultScopes;
  const unsupported = scopes.filter((scope) => !allowedScopes.has(scope));
  if (unsupported.length) throw new Error(`unsupported scope: ${unsupported.join(", ")}`);
  return scopes;
}

function formBody(entries) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === null || value === "") continue;
    body.set(key, Array.isArray(value) ? value.join(" ") : String(value));
  }
  return body;
}

function requiredString(value, field) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${field} is required`);
  return text;
}

async function readStore() {
  try {
    return JSON.parse(await readFile(tokenStorePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeStore(store) {
  await mkdir(dirname(tokenStorePath), { recursive: true, mode: 0o700 });
  const tmp = `${tokenStorePath}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, { mode: 0o600 });
  await chmod(tmp, 0o600).catch(() => undefined);
  await rename(tmp, tokenStorePath);
  await chmod(tokenStorePath, 0o600).catch(() => undefined);
}

async function clearStore() {
  await rm(tokenStorePath, { force: true }).catch(() => undefined);
}

function envAccessToken() {
  const token = process.env.RESISTANCE_TOOLS_MCP_TOKEN?.trim();
  return token || null;
}

function tokenUsable(store) {
  return typeof store.accessToken === "string" && store.accessToken.length > 20 && Number(store.accessExpiresAt ?? 0) > now() + 30_000;
}

async function refreshStoredToken(store = undefined) {
  const current = store ?? await readStore();
  if (typeof current.refreshToken !== "string" || !current.refreshToken) return null;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const activeClientId = current.clientId ?? await oauthClientId();
    const res = await fetch(`${issuer}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: formBody({
        grant_type: "refresh_token",
        refresh_token: current.refreshToken,
        client_id: activeClientId,
        resource: current.resource ?? resource,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      await clearStore();
      return null;
    }
    const next = tokenStoreFromResponse(body, activeClientId);
    await writeStore({ ...current, ...next, pendingDevice: undefined });
    return next.accessToken;
  })().finally(() => {
    refreshPromise = undefined;
  });
  return refreshPromise;
}

async function accessToken() {
  const envToken = envAccessToken();
  if (envToken) return envToken;
  const store = await readStore();
  if (tokenUsable(store)) return store.accessToken;
  return refreshStoredToken(store);
}

async function oauthClientId() {
  if (configuredClientId) return configuredClientId;
  const store = await readStore();
  if (typeof store.clientId === "string" && store.clientId) return store.clientId;

  const res = await fetch(`${issuer}/oauth/register`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_name: "Resistance Tools MCP Stdio Bridge",
      redirect_uris: ["http://localhost/callback"],
      grant_types: ["authorization_code", "refresh_token", deviceGrantType, tonProofGrantType],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || typeof body.client_id !== "string") {
    throw new Error(body.error ?? "client_registration_failed");
  }
  await writeStore({ ...store, clientId: body.client_id, registeredAt: new Date().toISOString() });
  return body.client_id;
}

function tokenStoreFromResponse(body, activeClientId) {
  if (!body || typeof body.access_token !== "string" || typeof body.refresh_token !== "string") {
    throw new Error("token response did not include access and refresh tokens");
  }
  const expiresIn = Number(body.expires_in ?? 0);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    tokenType: body.token_type ?? "Bearer",
    scope: body.scope ?? "",
    resource: body.resource ?? resource,
    clientId: activeClientId,
    accessExpiresAt: now() + Math.max(60, expiresIn) * 1000,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchWithBearer(input, init = {}) {
  const headers = new Headers(init.headers ?? {});
  const token = await accessToken().catch(() => null);
  if (token && !headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
  let response = await fetch(input, { ...init, headers });
  if (response.status !== 401 || envAccessToken()) return response;

  await response.body?.cancel().catch(() => undefined);
  const refreshed = await refreshStoredToken().catch(() => null);
  if (!refreshed) return fetch(input, { ...init, headers });
  headers.set("authorization", `Bearer ${refreshed}`);
  response = await fetch(input, { ...init, headers });
  return response;
}

async function createRemoteClient() {
  const client = new Client(
    { name: "resistance-tools-mcp-stdio-bridge", version: "0.1.0" },
    { capabilities: {} },
  );
  remoteTransport = new StreamableHTTPClientTransport(new URL(remoteUrl), { fetch: fetchWithBearer });
  await client.connect(remoteTransport);
  return client;
}

async function remoteClient() {
  remoteClientPromise ??= createRemoteClient().catch((error) => {
    remoteClientPromise = undefined;
    throw error;
  });
  return remoteClientPromise;
}

async function resetRemoteClient() {
  const client = await remoteClientPromise?.catch(() => undefined);
  remoteClientPromise = undefined;
  remoteTransport = undefined;
  await client?.close().catch(() => undefined);
}

async function forward(operation) {
  try {
    return await operation(await remoteClient());
  } catch (error) {
    await resetRemoteClient();
    throw error;
  }
}

const localTools = [
  {
    name: "auth.wallet_challenge",
    title: "Start controlled wallet auth",
    description: "Create an OAuth TON proof challenge for a wallet controlled by the agent. Sign tonProof.payload, then call auth.wallet_complete.",
    inputSchema: {
      type: "object",
      properties: {
        scopes: { type: "array", items: { type: "string" } },
        ownerWallet: { type: "string" },
        actorWallet: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "auth.wallet_complete",
    title: "Complete controlled wallet auth",
    description: "Exchange a signed TON proof for a scoped OAuth bearer token and store it locally for protected MCP calls.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string" },
        walletStateInit: { type: "string" },
        wallet_state_init: { type: "string" },
        proof: {
          type: "object",
          properties: {
            timestamp: { type: "number" },
            domain: {
              type: "object",
              properties: {
                lengthBytes: { type: "number" },
                value: { type: "string" },
              },
              required: ["lengthBytes", "value"],
              additionalProperties: true,
            },
            payload: { type: "string" },
            signature: { type: "string" },
          },
          required: ["timestamp", "domain", "payload", "signature"],
          additionalProperties: true,
        },
        scopes: { type: "array", items: { type: "string" } },
      },
      required: ["address", "proof"],
      anyOf: [
        { required: ["walletStateInit"] },
        { required: ["wallet_state_init"] },
      ],
      additionalProperties: false,
    },
  },
  {
    name: "auth.device_start",
    title: "Start browser wallet device auth",
    description: "Create an OAuth device authorization link. Open authorizationUrl, connect/approve in the browser, then call auth.device_complete.",
    inputSchema: {
      type: "object",
      properties: {
        scopes: { type: "array", items: { type: "string" } },
        actorWallet: { type: "string" },
        siteAllowlist: { type: "array", items: { type: "string" } },
        domainAllowlist: { type: "array", items: { type: "string" } },
        bagAllowlist: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  {
    name: "auth.device_complete",
    title: "Complete browser wallet device auth",
    description: "Poll the OAuth device token endpoint after the user approved the browser authorization screen.",
    inputSchema: {
      type: "object",
      properties: {
        deviceCode: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "auth.device_status",
    title: "Local MCP token status",
    description: "Return whether this stdio bridge has a local bearer token or pending device authorization.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "auth.device_revoke",
    title: "Revoke local MCP bearer token",
    description: "Revoke stored OAuth tokens for this stdio bridge and clear local auth state.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

function localToolByName(name) {
  return localTools.find((tool) => tool.name === name) ?? null;
}

async function startWalletAuth(input = {}) {
  const scopes = normalizeScopes(input.scopes);
  const activeClientId = await oauthClientId();
  const res = await fetch(`${issuer}/oauth/wallet/challenge`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: formBody({
      client_id: activeClientId,
      resource,
      scope: scopes,
      owner_wallet: input.ownerWallet,
      actor_wallet: input.actorWallet,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return jsonTool({ ok: false, error: body.error ?? "wallet_challenge_failed" }, true);

  return jsonTool({
    ok: true,
    authenticated: false,
    challenge: body.challenge,
    expiresIn: body.expires_in,
    clientId: body.client_id,
    resource: body.resource,
    scope: body.scope,
    ownerWallet: body.owner_wallet ?? null,
    actorWallet: body.actor_wallet ?? null,
    tonProof: body.ton_proof,
    next: "Sign tonProof.payload with the wallet controlled by the agent, then call auth.wallet_complete with the signed proof.",
  });
}

async function completeWalletAuth(input = {}) {
  const address = requiredString(input.address, "address");
  const walletStateInit = requiredString(input.walletStateInit ?? input.wallet_state_init, "walletStateInit");
  if (!input.proof || typeof input.proof !== "object") throw new Error("proof is required");
  const scopes = input.scopes === undefined ? undefined : normalizeScopes(input.scopes);
  const activeClientId = await oauthClientId();

  const res = await fetch(`${issuer}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: formBody({
      grant_type: tonProofGrantType,
      client_id: activeClientId,
      resource,
      scope: scopes,
      address,
      wallet_state_init: walletStateInit,
      proof: JSON.stringify(input.proof),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return jsonTool({ ok: false, authenticated: false, error: body.error ?? "wallet_token_failed" }, true);

  const store = await readStore();
  const nextStore = tokenStoreFromResponse(body, activeClientId);
  await writeStore({ ...store, ...nextStore, pendingDevice: undefined });
  await resetRemoteClient();
  return jsonTool({
    ok: true,
    authenticated: true,
    resource: nextStore.resource,
    scope: nextStore.scope,
    expiresAt: new Date(nextStore.accessExpiresAt).toISOString(),
    next: "Bearer token stored locally. Protected Resistance Tools MCP tools can now be called normally.",
  });
}

async function startDeviceAuth(input = {}) {
  const scopes = normalizeScopes(input.scopes);
  const siteAllowlist = normalizeStringArray(input.siteAllowlist, "siteAllowlist");
  const domainAllowlist = normalizeStringArray(input.domainAllowlist, "domainAllowlist");
  const bagAllowlist = normalizeStringArray(input.bagAllowlist, "bagAllowlist");
  const activeClientId = await oauthClientId();
  const res = await fetch(`${issuer}/oauth/device/code`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: formBody({
      client_id: activeClientId,
      resource,
      scope: scopes,
      actor_wallet: input.actorWallet,
      site_allowlist: siteAllowlist,
      domain_allowlist: domainAllowlist,
      bag_allowlist: bagAllowlist,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return jsonTool({ ok: false, error: body.error ?? "device_authorization_failed" }, true);

  const expiresAt = now() + Number(body.expires_in ?? 900) * 1000;
  const pendingDevice = {
    deviceCode: body.device_code,
    clientId: activeClientId,
    userCode: body.user_code,
    verificationUri: body.verification_uri,
    authorizationUrl: body.verification_uri_complete,
    expiresAt,
    interval: Number(body.interval ?? 5),
    scope: scopes.join(" "),
    createdAt: new Date().toISOString(),
  };
  const store = await readStore();
  await writeStore({ ...store, pendingDevice });
  return jsonTool({
    ok: true,
    authenticated: false,
    authorizationUrl: pendingDevice.authorizationUrl,
    userCode: pendingDevice.userCode,
    verificationUri: pendingDevice.verificationUri,
    expiresAt: new Date(expiresAt).toISOString(),
    interval: pendingDevice.interval,
    next: "Open authorizationUrl, connect wallet and approve, then call auth.device_complete.",
  });
}

async function completeDeviceAuth(input = {}) {
  const store = await readStore();
  const pending = store.pendingDevice ?? null;
  const deviceCode = String(input.deviceCode ?? pending?.deviceCode ?? "");
  if (!deviceCode) return jsonTool({ ok: false, authenticated: false, error: "device_code_required", next: "Call auth.device_start first." }, true);
  if (pending?.expiresAt && Number(pending.expiresAt) <= now()) {
    await writeStore({ ...store, pendingDevice: undefined });
    return jsonTool({ ok: false, authenticated: false, error: "expired_token", next: "Call auth.device_start again." }, true);
  }
  const activeClientId = pending?.clientId ?? await oauthClientId();

  const res = await fetch(`${issuer}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: formBody({
      grant_type: deviceGrantType,
      client_id: activeClientId,
      resource,
      device_code: deviceCode,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = body.error ?? "device_token_failed";
    const pendingLike = error === "authorization_pending" || error === "slow_down";
    if (!pendingLike) await writeStore({ ...store, pendingDevice: undefined });
    return jsonTool({
      ok: false,
      authenticated: false,
      error,
      userCode: pending?.userCode ?? null,
      authorizationUrl: pending?.authorizationUrl ?? null,
      next: pendingLike ? `Wait ${pending?.interval ?? 5}s after approval, then call auth.device_complete again.` : "Call auth.device_start again.",
    }, !pendingLike);
  }

  const nextStore = tokenStoreFromResponse(body, activeClientId);
  await writeStore({ ...store, ...nextStore, pendingDevice: undefined });
  await resetRemoteClient();
  return jsonTool({
    ok: true,
    authenticated: true,
    resource: nextStore.resource,
    scope: nextStore.scope,
    expiresAt: new Date(nextStore.accessExpiresAt).toISOString(),
    next: "Bearer token stored locally. Protected Resistance Tools MCP tools can now be called normally.",
  });
}

async function localAuthStatus() {
  const envToken = envAccessToken();
  const store = await readStore();
  return jsonTool({
    authenticated: Boolean(envToken || tokenUsable(store)),
    tokenSource: envToken ? "env:RESISTANCE_TOOLS_MCP_TOKEN" : tokenUsable(store) ? "local_store" : null,
    accessExpiresAt: store.accessExpiresAt ? new Date(Number(store.accessExpiresAt)).toISOString() : null,
    hasRefreshToken: typeof store.refreshToken === "string" && Boolean(store.refreshToken),
    pendingDevice: store.pendingDevice
      ? {
          userCode: store.pendingDevice.userCode,
          authorizationUrl: store.pendingDevice.authorizationUrl,
          expiresAt: new Date(Number(store.pendingDevice.expiresAt)).toISOString(),
        }
      : null,
  });
}

async function revokeLocalAuth() {
  const store = await readStore();
  for (const token of [store.accessToken, store.refreshToken].filter(Boolean)) {
    await fetch(`${issuer}/oauth/revoke`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: formBody({ token }),
    }).catch(() => undefined);
  }
  await clearStore();
  await resetRemoteClient();
  return jsonTool({ ok: true, authenticated: false });
}

async function handleLocalTool(name, args) {
  try {
    if (name === "auth.wallet_challenge") return startWalletAuth(args);
    if (name === "auth.wallet_complete") return completeWalletAuth(args);
    if (name === "auth.device_start") return startDeviceAuth(args);
    if (name === "auth.device_complete") return completeDeviceAuth(args);
    if (name === "auth.device_status") return localAuthStatus();
    if (name === "auth.device_revoke") return revokeLocalAuth();
    return jsonTool({ ok: false, error: "unknown_tool" }, true);
  } catch (error) {
    return jsonTool({ ok: false, error: error instanceof Error ? error.message : String(error) }, true);
  }
}

const server = new Server(
  { name: "resistance-tools-mcp-bridge", version: "0.1.0" },
  {
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true },
      prompts: { listChanged: true },
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  const remoteTools = await forward((client) => client.listTools(request.params ?? {}));
  const names = new Set(localTools.map((tool) => tool.name));
  return {
    ...remoteTools,
    tools: [...localTools, ...(remoteTools.tools ?? []).filter((tool) => !names.has(tool.name))],
  };
});

server.setRequestHandler(CallToolRequestSchema, (request) => {
  const name = request.params?.name;
  if (localToolByName(name)) return handleLocalTool(name, request.params?.arguments ?? {});
  return forward((client) => client.callTool(request.params));
});

server.setRequestHandler(ListResourcesRequestSchema, (request) =>
  forward((client) => client.listResources(request.params ?? {})),
);

server.setRequestHandler(ReadResourceRequestSchema, (request) =>
  forward((client) => client.readResource(request.params)),
);

server.setRequestHandler(ListResourceTemplatesRequestSchema, (request) =>
  forward((client) => client.listResourceTemplates(request.params ?? {})),
);

server.setRequestHandler(ListPromptsRequestSchema, (request) =>
  forward((client) => client.listPrompts(request.params ?? {})),
);

server.setRequestHandler(GetPromptRequestSchema, (request) =>
  forward((client) => client.getPrompt(request.params)),
);

const stdio = new StdioServerTransport();

process.on("SIGINT", async () => {
  await resetRemoteClient();
  process.exit(130);
});

process.on("SIGTERM", async () => {
  await resetRemoteClient();
  process.exit(143);
});

await server.connect(stdio);
