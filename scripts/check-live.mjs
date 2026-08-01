import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const catalog = JSON.parse(await readFile(new URL("../catalog/mcp.json", import.meta.url), "utf8"));
const endpoint = process.env.RESISTANCE_TOOLS_MCP_URL ?? catalog.endpoint;
const client = new Client({ name: "resistance-tools-contract-check", version: catalog.bridgeVersion });

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  const tools = await client.listTools();
  const resources = await client.listResources();
  assert.deepEqual(
    tools.tools.map(({ name }) => name).sort(),
    catalog.remoteTools.map(({ name }) => name).sort(),
    "live tool catalog drift",
  );
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
  console.log(`live MCP contract matches ${endpoint}`);
} finally {
  await client.close().catch(() => undefined);
}
