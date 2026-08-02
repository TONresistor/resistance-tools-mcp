import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { allScopes, annotationProfiles, expectedToolContracts } from "./catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(await read("catalog/mcp.json"));
const registry = JSON.parse(await read("server.json"));
const pkg = JSON.parse(await read("package.json"));
const readme = await read("README.md");
const skill = await read("SKILL.md");
const toolsDoc = await read("docs/tools.md");
const templatesDoc = await read("docs/templates.md");
const authDoc = await read("docs/auth.md");
const responseDoc = await read("docs/response-style.md");
const openAiYaml = await read("agents/openai.yaml");

const methodDocPaths = [
  "docs/core-methods.md",
  "docs/sites-methods.md",
  "docs/dns-methods.md",
  "docs/subdomains-methods.md",
  "docs/storage-methods.md",
];
const methodDocs = await Promise.all(methodDocPaths.map(async (path) => [path, await read(path)]));
const storageDoc = methodDocs.find(([path]) => path === "docs/storage-methods.md")?.[1] ?? "";
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
assert.equal(catalog.remoteTools.length, 46);
assert.equal(new Set(catalog.remoteTools.map(({ name }) => name)).size, 46);
assert.deepEqual(
  [...new Set(catalog.remoteTools.map(({ scope }) => scope).filter((scope) => scope !== "public"))].sort(),
  [...allScopes].sort(),
);
for (const tool of catalog.remoteTools) {
  assert.ok(annotationProfiles[tool.annotations], `unknown annotation profile for ${tool.name}`);
}

for (const { name } of expectedToolContracts) assert.ok(toolsDoc.includes(`\`${name}\``), `docs/tools.md missing ${name}`);
for (const uri of expectedResources) assert.ok(toolsDoc.includes(`\`${uri}\``), `docs/tools.md missing ${uri}`);
for (const template of expectedTemplates) assert.ok(templatesDoc.includes(`\`${template}\``), `docs/templates.md missing ${template}`);
for (const scope of allScopes) assert.ok(authDoc.includes(`\`${scope}\``), `docs/auth.md missing ${scope}`);

const documentedMethods = [];
for (const [path, doc] of methodDocs) {
  const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const section = doc.slice(heading.index, headings[index + 1]?.index ?? doc.length);
    documentedMethods.push(heading[1]);
    for (const marker of ["**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
      assert.ok(section.includes(marker), `${path} ${heading[1]} missing ${marker}`);
    }
  }
}
assert.equal(documentedMethods.length, 46, "method guides must document exactly 46 tools");
assert.equal(new Set(documentedMethods).size, 46, "method guides contain duplicate tool sections");
assert.deepEqual(documentedMethods.sort(), expectedToolContracts.map(({ name }) => name).sort());

for (const path of [...methodDocPaths, "docs/response-style.md", "docs/tools.md", "docs/templates.md", "docs/auth.md"]) {
  assert.ok(skill.includes(`](${path})`), `SKILL.md does not route to ${path}`);
}

assert.match(readme, /codex mcp add resistance-tools/);
assert.match(readme, /codex mcp login resistance-tools/);
assert.match(readme, /claude mcp add --transport http resistance-tools/);
assert.match(readme, /Streamable HTTP/);
assert.match(authDoc, /user selects? (?:them|the permissions)/i);
assert.match(authDoc, /`Approve all`/);
assert.match(authDoc, /`Disapprove all`/);
for (const [name, text] of Object.entries({ README: readme, auth: authDoc })) {
  assert.match(text, /run `\/mcp`/i, `${name} missing current Claude Code OAuth flow`);
}
assert.doesNotMatch(`${readme}\n${skill}\n${authDoc}`, /--scopes|--oauth-resource/);
assert.match(skill, /user select(?:s)? permissions on the approval page/i);
assert.doesNotMatch(skill, /## Scope choice/i);

const publicDocs = [readme, skill, toolsDoc, templatesDoc, authDoc, responseDoc, ...methodDocs.map(([, doc]) => doc)].join("\n");
for (const retired of [
  "dns.prepare_record_tx",
  "dns.prepare_site_record_tx",
  "dns:prepare_tx",
  "dns:send_tx",
  "storage:send_tx",
  "sites:send_tx",
  "payments:send_tx",
  "subdomains:send_tx",
]) {
  assert.equal(publicDocs.includes(retired), false, `public documentation still contains retired name ${retired}`);
}
assert.doesNotMatch(publicDocs, /npm install|\bnpx\b|stdio|bridge|auth\.(device|wallet)_/i);

for (const marker of ["Domain:", "Gateway:", "TON Site:", "Release:"]) {
  assert.ok(responseDoc.includes(marker), `response style missing ${marker}`);
}
for (const state of ["prepared", "awaiting confirmation", "submitted", "confirmed", "published", "live"]) {
  assert.ok(`${skill}\n${responseDoc}`.includes(state), `response guidance missing state ${state}`);
}
assert.match(skill, /operationId.*MCP confirmation request/i);
assert.match(storageDoc, /never pass the MCP confirmation request's `operationId`/i);
assert.match(responseDoc, /do not add boilerplate explaining that the agent cannot sign/i);

assert.match(openAiYaml, /default_prompt: "Use \$resistance-tools-mcp/);
assert.match(openAiYaml, /value: "resistance-tools"/);
assert.match(openAiYaml, /transport: "streamable_http"/);
assert.ok(openAiYaml.includes(`url: "${endpoint}"`));
assert.match(openAiYaml, /allow_implicit_invocation: true/);

console.log("46 live tools, method guides, metadata and user guidance are aligned");
