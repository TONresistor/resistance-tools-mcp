import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { allScopes, annotationProfiles, expectedToolContracts } from "./catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

const catalog = await readJson("catalog/mcp.json");
const registry = await readJson("server.json");
const pkg = await readJson("package.json");
const codexPlugin = await readJson(".codex-plugin/plugin.json");
const claudePlugin = await readJson(".claude-plugin/plugin.json");
const mcpConfig = await readJson(".mcp.json");
const readme = await read("README.md");

const skillNames = ["domains", "sites", "storage", "transactions", "wallet"];
const skillToolNames = {
  wallet: [
    "auth.status",
    "auth.policy",
    "wallet.me",
    "mcp.access.list",
    "mcp.audit.list",
    "mcp.audit.summary",
    "mcp.access.revoke_consent",
  ],
  sites: [
    "sites.list",
    "sites.get_content",
    "sites.list_releases",
    "media.upload_image",
    "sites.publish_files",
    "sites.publish_template",
    "sites.rollback",
    "sites.delete",
    "deployments.list",
  ],
  domains: [
    "dns.lookup",
    "domains.list",
    "domains.records",
    "subdomains.list_collections",
    "subdomains.list_items",
    "subdomains.get_collection",
    "subdomains.get_item",
    "subdomains.control",
  ],
  storage: [
    "storage.list_bags",
    "storage.bag_details",
    "storage.providers",
    "storage.provider_funding_session",
    "storage.provider_funding_preview",
    "storage.provider_quote",
    "storage.provider_operation",
    "storage.create_bag",
    "storage.pin_bag",
    "storage.delete_bag",
  ],
  transactions: [
    "sites.send_link_tx",
    "payments.send_tx",
    "dns.send_record_tx",
    "dns.send_name_tx",
    "dns.send_renew_tx",
    "subdomains.create_collection_tx",
    "subdomains.mint_tx",
    "subdomains.collection_action_tx",
    "subdomains.transfer_item_tx",
    "subdomains.recovery_tx",
    "storage.send_bag_link_tx",
    "storage.send_provider_tx",
  ],
};

const skillDirectories = (await readdir(new URL("../skills/", import.meta.url), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(skillDirectories, skillNames);

const skills = new Map();
const toolReferences = new Map();
const openAiMetadata = new Map();
for (const name of skillNames) {
  skills.set(name, await read(`skills/${name}/SKILL.md`));
  toolReferences.set(name, await read(`skills/${name}/references/tools.md`));
  openAiMetadata.set(name, await read(`skills/${name}/agents/openai.yaml`));
}
const templatesReference = await read("skills/sites/references/templates.md");

const expectedResources = [
  "tonsite://wallet",
  "tonsite://sites",
  "tonsite://deployments",
  "tonsite://domains",
  "tonsite://bags",
];
const expectedTemplates = ["links", "blog", "redirect", "token", "sale", "tip"];
const endpoint = "https://app.resistance.dog/api/mcp";
const registryName = "io.github.TONresistor/resistance-tools-mcp";

assert.equal(pkg.private, true);
assert.equal(pkg.version, catalog.serverVersion);
assert.equal(pkg.version, registry.version);
assert.equal(pkg.version, codexPlugin.version);
assert.equal(pkg.version, claudePlugin.version);
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

assert.equal(codexPlugin.name, "resistance-tools");
assert.equal(codexPlugin.skills, "./skills/");
assert.equal(codexPlugin.mcpServers, "./.mcp.json");
assert.equal(codexPlugin.author?.name, "Digital Resistance");
assert.equal(codexPlugin.interface?.displayName, "Resistance Tools");
assert.ok(codexPlugin.interface?.defaultPrompt);
assert.equal(claudePlugin.name, "resistance-tools");
assert.equal(claudePlugin.author?.name, "Digital Resistance");
assert.deepEqual(mcpConfig, {
  mcpServers: {
    "resistance-tools": {
      type: "http",
      url: endpoint,
    },
  },
});

for (const name of skillNames) {
  const skill = skills.get(name);
  const metadata = openAiMetadata.get(name);
  assert.match(skill, new RegExp(`^---\\nname: ${name}\\ndescription: [^\\n]+\\n---\\n`));
  assert.ok(skill.includes("[references/tools.md](references/tools.md)"), `${name} does not route to its tool reference`);
  assert.equal(skill.includes("TODO"), false, `${name} contains a TODO`);
  assert.ok(skill.split("\n").length < 500, `${name} SKILL.md must stay under 500 lines`);
  assert.match(metadata, new RegExp(`default_prompt: "[^"]*\\$${name}[^\"]*"`));
  assert.match(metadata, /value: "resistance-tools"/);
  assert.match(metadata, /transport: "streamable_http"/);
  assert.ok(metadata.includes(`url: "${endpoint}"`));
  assert.match(metadata, /allow_implicit_invocation: true/);
}
assert.ok(skills.get("sites").includes("[references/templates.md](references/templates.md)"));

const documentedMethods = [];
for (const name of skillNames) {
  const doc = toolReferences.get(name);
  const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
  const expectedForSkill = skillToolNames[name];
  assert.deepEqual(
    headings.map((heading) => heading[1]).sort(),
    [...expectedForSkill].sort(),
    `${name} has the wrong tool coverage`,
  );
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const section = doc.slice(heading.index, headings[index + 1]?.index ?? doc.length);
    documentedMethods.push(heading[1]);
    for (const marker of ["**Permission:**", "**Input:**", "**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
      assert.ok(section.includes(marker), `${name} ${heading[1]} missing ${marker}`);
    }
  }
}
assert.equal(documentedMethods.length, 46, "skills must document exactly 46 tools");
assert.equal(new Set(documentedMethods).size, 46, "skills contain duplicate tool methods");
assert.deepEqual(documentedMethods.sort(), expectedToolContracts.map(({ name }) => name).sort());

const transactionMethods = skillToolNames.transactions;
assert.deepEqual(
  [...transactionMethods].sort(),
  expectedToolContracts.filter(({ scope }) => scope === "transactions:request").map(({ name }) => name).sort(),
);

for (const template of expectedTemplates) {
  assert.ok(templatesReference.includes(`\`${template}\``), `template reference missing ${template}`);
}
const combinedReferences = [...toolReferences.values()].join("\n");
for (const scope of allScopes) {
  assert.ok(combinedReferences.includes(`\`${scope}\``), `tool references missing permission ${scope}`);
}
for (const uri of expectedResources) {
  assert.ok(toolReferences.get("wallet").includes(`\`${uri}\``), `wallet reference missing ${uri}`);
}

assert.match(readme, /codex mcp add resistance-tools/);
assert.match(readme, /codex mcp login resistance-tools/);
assert.match(readme, /claude mcp add --transport http resistance-tools/);
assert.match(readme, /tools only; they do not install the bundled skills/i);
for (const name of skillNames) {
  assert.ok(readme.includes(`\`${name}\``), `README missing skill ${name}`);
}

const publicGuidance = [
  readme,
  ...skills.values(),
  ...toolReferences.values(),
  templatesReference,
  ...openAiMetadata.values(),
].join("\n");
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
  assert.equal(publicGuidance.includes(retired), false, `guidance contains retired name ${retired}`);
}
assert.doesNotMatch(publicGuidance, /--scopes|--oauth-resource|auth\.(device|wallet)_/i);

for (const marker of ["Domain:", "Gateway:", "TON Site:", "Release:"]) {
  assert.ok(skills.get("sites").includes(marker), `sites result contract missing ${marker}`);
}
for (const state of ["prepared", "awaiting confirmation", "submitted", "confirmed", "published", "live"]) {
  assert.ok(publicGuidance.includes(state), `guidance missing state ${state}`);
}
assert.match(skills.get("transactions"), /operationId.*MCP confirmation request/i);
assert.match(skills.get("storage"), /Never pass it to `storage\.provider_operation`/i);
assert.match(skills.get("transactions"), /Do not add boilerplate saying the agent cannot sign/i);
assert.match(skills.get("wallet"), /Let the user select permissions/i);

await assert.rejects(read("SKILL.md"), (error) => error?.code === "ENOENT");

console.log("5 Agent Skills, 46 live tools, cross-client plugin metadata, and user guidance are aligned");
