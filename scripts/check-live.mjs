import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  allScopes,
  annotationProfiles,
  expectedToolContracts,
} from "./catalog-contract.mjs";

const catalog = JSON.parse(await readFile(new URL("../catalog/mcp.json", import.meta.url), "utf8"));
const endpoint = process.env.RESISTANCE_TOOLS_MCP_URL ?? catalog.endpoint;
const endpointUrl = new URL(endpoint);
const issuer = endpointUrl.origin;
const resourceMetadataUrl = new URL(`/.well-known/oauth-protected-resource${endpointUrl.pathname}`, issuer).href;
const requestHeaders = {
  accept: "application/json, text/event-stream",
  "content-type": "application/json",
  "mcp-protocol-version": "2025-11-25",
};

const toolContract = new Map(expectedToolContracts.map((tool) => [tool.name, tool]));

function expectedSecuritySchemes(scope) {
  return scope === "public"
    ? [{ type: "noauth" }]
    : [{ type: "oauth2", scopes: [scope] }];
}

function assertToolDescriptors(tools, { requireTopLevel }) {
  assert.deepEqual(
    tools.map(({ name }) => name).sort(),
    expectedToolContracts.map(({ name }) => name).sort(),
    "live tool catalog drift",
  );
  for (const descriptor of tools) {
    const expected = toolContract.get(descriptor.name);
    assert.ok(expected, `unexpected live tool ${descriptor.name}`);
    assert.deepEqual(
      descriptor.annotations,
      annotationProfiles[expected.annotations],
      `${descriptor.name} annotations drift`,
    );
    const securitySchemes = expectedSecuritySchemes(expected.scope);
    assert.deepEqual(
      descriptor._meta?.securitySchemes,
      securitySchemes,
      `${descriptor.name} _meta.securitySchemes drift`,
    );
    if (requireTopLevel) {
      assert.deepEqual(
        descriptor.securitySchemes,
        securitySchemes,
        `${descriptor.name} top-level securitySchemes drift`,
      );
    }
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  assert.equal(response.ok, true, `${url} returned HTTP ${response.status}`);
  return response.json();
}

async function checkOAuthDiscovery() {
  const root = await fetchJson(new URL("/.well-known/oauth-protected-resource", issuer));
  const resource = await fetchJson(resourceMetadataUrl);
  for (const metadata of [root, resource]) {
    assert.equal(metadata.resource, endpoint);
    assert.equal(metadata.resource_name, "Resistance Tools MCP");
    assert.equal(metadata.resource_documentation, "https://github.com/TONresistor/resistance-tools-mcp#readme");
    assert.deepEqual(metadata.authorization_servers, [issuer]);
    assert.deepEqual(metadata.bearer_methods_supported, ["header"]);
    assert.deepEqual(metadata.scopes_supported, allScopes);
    assert.equal("all_scopes_supported" in metadata, false);
  }

  const authorization = await fetchJson(new URL("/.well-known/oauth-authorization-server", issuer));
  assert.equal(authorization.issuer, issuer);
  assert.equal(authorization.authorization_endpoint, `${issuer}/oauth/authorize`);
  assert.equal(authorization.token_endpoint, `${issuer}/oauth/token`);
  assert.equal(authorization.registration_endpoint, `${issuer}/oauth/register`);
  assert.equal(authorization.revocation_endpoint, `${issuer}/oauth/revoke`);
  assert.deepEqual(authorization.protected_resources, [endpoint]);
  assert.deepEqual(authorization.scopes_supported, allScopes);
}

function parseRpcResponse(text, contentType) {
  if (!text) return null;
  if (!contentType.includes("text/event-stream")) return JSON.parse(text);
  const data = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  assert.ok(data.length > 0, "MCP SSE response contained no data event");
  return JSON.parse(data.at(-1));
}

async function rawPost(message, sessionId, extraHeaders = {}) {
  const headers = { ...requestHeaders, ...extraHeaders };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });
  const text = await response.text();
  return {
    response,
    body: parseRpcResponse(text, response.headers.get("content-type") ?? ""),
  };
}

async function checkRawProtocol() {
  const initialized = await rawPost({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "resistance-tools-raw-contract-check", version: catalog.serverVersion },
    },
  });
  assert.equal(initialized.response.ok, true, `raw initialize returned HTTP ${initialized.response.status}`);
  assert.equal(initialized.body?.result?.protocolVersion, "2025-11-25");
  const sessionId = initialized.response.headers.get("mcp-session-id");
  assert.ok(sessionId, "raw initialize did not return mcp-session-id");

  try {
    const notification = await rawPost({ jsonrpc: "2.0", method: "notifications/initialized" }, sessionId);
    assert.ok([200, 202, 204].includes(notification.response.status), `initialized notification returned HTTP ${notification.response.status}`);

    const listed = await rawPost({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }, sessionId);
    assert.equal(listed.response.ok, true, `raw tools/list returned HTTP ${listed.response.status}`);
    assertToolDescriptors(listed.body?.result?.tools ?? [], { requireTopLevel: true });

    const unauthorized = await rawPost({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "wallet.me", arguments: {} },
    }, sessionId);
    assert.equal(unauthorized.response.status, 401, "unauthenticated wallet.me must return HTTP 401");
    const challenge = unauthorized.response.headers.get("www-authenticate") ?? "";
    assert.match(challenge, /^Bearer\b/i);
    assert.ok(challenge.includes(`resource_metadata="${resourceMetadataUrl}"`), "401 challenge is missing resource metadata");
    assert.ok(challenge.includes('scope="wallet:read"'), "401 challenge is missing wallet:read");

    const invalidToken = await rawPost({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "sites.delete", arguments: { site: "demo.ton", confirmSite: "demo.ton" } },
    }, sessionId, { authorization: "Bearer invalid-contract-check-token" });
    assert.equal(invalidToken.response.status, 401, "invalid bearer must return HTTP 401");
    const invalidChallenge = invalidToken.response.headers.get("www-authenticate") ?? "";
    assert.ok(invalidChallenge.includes('error="invalid_token"'), "invalid bearer challenge is missing invalid_token");
    assert.doesNotMatch(invalidChallenge, /(?:^|,)scope="/, "invalid bearer challenge must not advertise unrelated scopes");
  } finally {
    await fetch(endpoint, {
      method: "DELETE",
      headers: { ...requestHeaders, "mcp-session-id": sessionId },
    }).catch(() => undefined);
  }
}

async function checkSdkContract() {
  const client = new Client({ name: "resistance-tools-contract-check", version: catalog.serverVersion });
  try {
    await client.connect(new StreamableHTTPClientTransport(endpointUrl));
    assert.deepEqual(client.getServerVersion(), {
      name: "resistance-tools-mcp",
      version: catalog.serverVersion,
    }, "live MCP server identity or version drift");
    const tools = await client.listTools();
    const resources = await client.listResources();
    assertToolDescriptors(tools.tools, { requireTopLevel: false });
    assert.deepEqual(
      resources.resources.map(({ uri }) => uri).sort(),
      catalog.resources.map(({ uri }) => uri).sort(),
      "live resource catalog drift",
    );

    const policy = await client.callTool({ name: "auth.policy", arguments: {} });
    const content = policy.structuredContent;
    assert.deepEqual(content?.sitePublishing?.templates, catalog.templates, "live template catalog drift");
    assert.deepEqual(content?.sitePublishing?.supportedTargets, catalog.siteTargets, "live site target drift");
    assert.equal(content?.sitePublishing?.mediaUpload?.tool, "media.upload_image");
    assert.equal(content?.sitePublishing?.mediaUpload?.scope, "media:write");
  } finally {
    await client.close().catch(() => undefined);
  }
}

await checkSdkContract();
await checkOAuthDiscovery();
await checkRawProtocol();
console.log(`live MCP and OAuth contract match ${endpoint}`);
