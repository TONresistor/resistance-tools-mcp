import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../server.json", import.meta.url), "utf8"));
const allowAbsent = process.argv.includes("--allow-absent");
const wait = process.argv.includes("--wait");
const attempts = wait ? 8 : 1;
const registryUrl = new URL("https://registry.modelcontextprotocol.io/v0/servers");
registryUrl.searchParams.set("search", manifest.name);
registryUrl.searchParams.set("version", manifest.version);
registryUrl.searchParams.set("limit", "100");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function exactRegistryEntry() {
  const response = await fetch(registryUrl, { headers: { accept: "application/json" } });
  assert.equal(response.ok, true, `Registry lookup failed: HTTP ${response.status}`);
  const body = await response.json();
  assert.ok(Array.isArray(body.servers), "Registry response is missing servers[]");
  return body.servers.find(({ server }) => server?.name === manifest.name && server?.version === manifest.version)?.server;
}

let published;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  published = await exactRegistryEntry();
  if (published) break;
  if (attempt < attempts) await sleep(5_000);
}

if (!published) {
  if (allowAbsent) {
    console.log(`${manifest.name}@${manifest.version} is not published yet`);
    process.exit(0);
  }
  console.error(`${manifest.name}@${manifest.version} was not found in the MCP Registry`);
  process.exit(2);
}

for (const key of ["name", "title", "description", "version", "repository", "websiteUrl", "remotes"]) {
  assert.deepEqual(published[key], manifest[key], `Registry ${key} does not match server.json`);
}

console.log(`MCP Registry matches ${manifest.name}@${manifest.version}`);
