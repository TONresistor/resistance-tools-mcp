import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { annotationProfiles, expectedToolContracts } from "./catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(await read("catalog/mcp.json"));
const registry = JSON.parse(await read("server.json"));
const pkg = JSON.parse(await read("package.json"));
const readme = await read("README.md");
const skill = await read("SKILL.md");
const toolsDoc = await read("docs/tools.md");
const templatesDoc = await read("docs/templates.md");
const authDoc = await read("docs/auth.md");

const expectedResources = [
  "tonsite://wallet", "tonsite://sites", "tonsite://deployments", "tonsite://domains", "tonsite://bags",
];
const expectedTemplates = ["links", "blog", "redirect", "token", "sale", "tip"];
const endpoint = "https://app.resistance.dog/api/mcp";
const registryName = "io.github.TONresistor/resistance-tools-mcp";

assert.equal(pkg.private, true);
assert.equal(pkg.version, catalog.serverVersion);
assert.equal(pkg.version, registry.version);
assert.equal("bin" in pkg, false);
assert.equal("publishConfig" in pkg, false);

assert.equal(registry.$schema, "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json");
assert.equal(registry.name, registryName);
assert.equal(registry.repository?.url, "https://github.com/TONresistor/resistance-tools-mcp");
assert.deepEqual(registry.remotes, [{ type: "streamable-http", url: endpoint }]);
assert.equal("packages" in registry, false);

assert.equal(catalog.registryName, registryName);
assert.equal(catalog.endpoint, endpoint);
assert.equal(catalog.transport, "streamable-http");
assert.deepEqual(catalog.remoteTools, expectedToolContracts);
assert.deepEqual(catalog.resources.map(({ uri }) => uri), expectedResources);
assert.deepEqual(catalog.templates, expectedTemplates);
assert.equal(new Set(catalog.remoteTools.map(({ name }) => name)).size, 26);
for (const tool of catalog.remoteTools) {
  assert.ok(annotationProfiles[tool.annotations], `unknown annotation profile for ${tool.name}`);
}

for (const { name } of expectedToolContracts) assert.ok(toolsDoc.includes(`\`${name}\``), `docs/tools.md missing ${name}`);
for (const uri of expectedResources) assert.ok(toolsDoc.includes(`\`${uri}\``), `docs/tools.md missing ${uri}`);
for (const template of expectedTemplates) assert.ok(templatesDoc.includes(`\`${template}\``), `docs/templates.md missing ${template}`);
for (const scope of new Set(catalog.remoteTools.map(({ scope }) => scope).filter((scope) => scope !== "public"))) {
  assert.ok(authDoc.includes(`\`${scope}\``), `docs/auth.md missing ${scope}`);
}

assert.match(readme, /codex mcp add resistance-tools/);
assert.match(readme, /codex mcp login resistance-tools/);
assert.match(readme, /claude mcp add --transport http resistance-tools/);
assert.match(readme, /Streamable HTTP/);
assert.match(authDoc, /select the permissions/i);
for (const [name, text] of Object.entries({ README: readme, SKILL: skill, auth: authDoc })) {
  assert.match(text, /run `\/mcp`/i, `${name} missing current Claude Code OAuth flow`);
}
assert.doesNotMatch(`${readme}\n${skill}\n${authDoc}`, /--scopes/);
assert.doesNotMatch(`${readme}\n${skill}\n${authDoc}`, /claude mcp login/);
assert.match(skill, /user select(?:s)? permissions on the approval page/i);
assert.match(skill, /never enumerate, recommend or request individual scopes/i);
assert.doesNotMatch(skill, /## Scope choice/i);
for (const scope of new Set(catalog.remoteTools.map(({ scope }) => scope).filter((scope) => scope !== "public"))) {
  assert.equal(skill.includes(`\`${scope}\``), false, `SKILL.md must not choose the user's ${scope} permission`);
}
for (const marker of [
  "auth.status", "auth.policy", "wallet.me", "sites.*", "deployments.list", "dns.lookup",
  "domains.*", "dns.prepare_*", "media.upload_image", "storage.*", "mcp.access.*", "mcp.audit.*",
]) {
  assert.ok(skill.includes(`\`${marker}\``), `SKILL.md missing tool coverage marker ${marker}`);
}
for (const template of expectedTemplates) assert.ok(skill.includes(`\`${template}\``), `SKILL.md missing template ${template}`);

for (const [name, text] of Object.entries({ README: readme, SKILL: skill, auth: authDoc })) {
  assert.doesNotMatch(text, /npm install|\bnpx\b|stdio|bridge|auth\.(device|wallet)_/i, `${name} still documents the removed local bridge`);
}

for (const uri of expectedResources) assert.ok(skill.includes(`\`${uri}\``), `SKILL.md missing exact resource URI ${uri}`);

console.log("remote MCP metadata, catalog and documentation are aligned");
