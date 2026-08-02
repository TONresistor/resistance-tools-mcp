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
const codexMarketplace = await readJson(".agents/plugins/marketplace.json");
const claudeMarketplace = await readJson(".claude-plugin/marketplace.json");
const mcpConfig = await readJson(".mcp.json");
const readme = await read("README.md");
const skill = await read("skills/resistance-tools-skill/SKILL.md");
const openAiMetadata = await read("skills/resistance-tools-skill/agents/openai.yaml");
const releaseWorkflow = await read(".github/workflows/release.yml");

const referenceToolNames = {
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
const referenceNames = Object.keys(referenceToolNames).sort();
const references = new Map();
for (const name of referenceNames) {
  references.set(name, await read(`skills/resistance-tools-skill/references/${name}.md`));
}

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

assert.equal(codexPlugin.name, "resistance-tools-mcp");
assert.equal(codexPlugin.skills, "./skills/");
assert.equal(codexPlugin.mcpServers, "./.mcp.json");
assert.equal(codexPlugin.author?.name, "Digital Resistance");
assert.equal(codexPlugin.interface?.displayName, "Resistance Tools");
assert.match(codexPlugin.interface?.defaultPrompt ?? "", /\$resistance-tools-skill/);
assert.equal(claudePlugin.name, "resistance-tools-mcp");
assert.equal(claudePlugin.author?.name, "Digital Resistance");
assert.equal(codexMarketplace.name, "resistance-tools");
assert.deepEqual(codexMarketplace.plugins, [
  {
    name: "resistance-tools-mcp",
    source: { source: "local", path: "./" },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Productivity",
  },
]);
assert.equal(claudeMarketplace.name, "resistance-tools");
assert.equal(claudeMarketplace.owner?.name, "Digital Resistance");
assert.deepEqual(claudeMarketplace.plugins, [
  {
    name: "resistance-tools-mcp",
    source: "./",
    description: claudePlugin.description,
  },
]);
assert.deepEqual(mcpConfig, {
  mcpServers: {
    "resistance-tools-mcp": { type: "http", url: endpoint },
  },
});

const skillDirectories = (await readdir(new URL("../skills/", import.meta.url), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(skillDirectories, ["resistance-tools-skill"]);
assert.match(skill, /^---\nname: resistance-tools-skill\ndescription: [^\n]+\n---\n/);
assert.equal(skill.includes("TODO"), false);
assert.ok(skill.split("\n").length < 500);
for (const name of referenceNames) {
  assert.ok(skill.includes(`[references/${name}.md](references/${name}.md)`), `skill does not route to ${name}.md`);
}
assert.match(openAiMetadata, /default_prompt: "Use \$resistance-tools-skill/);
assert.match(openAiMetadata, /value: "resistance-tools-mcp"/);
assert.match(openAiMetadata, /transport: "streamable_http"/);
assert.ok(openAiMetadata.includes(`url: "${endpoint}"`));
assert.match(openAiMetadata, /allow_implicit_invocation: true/);

const documentedMethods = [];
for (const name of referenceNames) {
  const doc = references.get(name);
  const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
  assert.deepEqual(
    headings.map((heading) => heading[1]).sort(),
    [...referenceToolNames[name]].sort(),
    `${name}.md has the wrong tool coverage`,
  );
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const section = doc.slice(heading.index, headings[index + 1]?.index ?? doc.length);
    documentedMethods.push(heading[1]);
    for (const marker of ["**Permission:**", "**Input:**", "**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
      assert.ok(section.includes(marker), `${name}.md ${heading[1]} missing ${marker}`);
    }
  }
}
assert.equal(documentedMethods.length, 46, "references must document exactly 46 tools");
assert.equal(new Set(documentedMethods).size, 46, "references contain duplicate tool methods");
assert.deepEqual(documentedMethods.sort(), expectedToolContracts.map(({ name }) => name).sort());
assert.deepEqual(
  [...referenceToolNames.transactions].sort(),
  expectedToolContracts.filter(({ scope }) => scope === "transactions:request").map(({ name }) => name).sort(),
);

for (const template of expectedTemplates) {
  assert.ok(references.get("sites").includes(`\`${template}\``), `sites.md missing template ${template}`);
}
const combinedReferences = [...references.values()].join("\n");
for (const scope of allScopes) {
  assert.ok(combinedReferences.includes(`\`${scope}\``), `references missing permission ${scope}`);
}
for (const uri of expectedResources) {
  assert.ok(references.get("wallet").includes(`\`${uri}\``), `wallet.md missing ${uri}`);
}

assert.match(readme, /one `resistance-tools-skill` skill/i);
assert.match(readme, /invoked as `\$resistance-tools-skill`/i);
assert.match(readme, /codex plugin marketplace add TONresistor\/resistance-tools-mcp --ref main/);
assert.match(readme, /codex plugin add resistance-tools-mcp@resistance-tools/);
assert.match(readme, /claude plugin marketplace add TONresistor\/resistance-tools-mcp@main/);
assert.match(readme, /claude plugin install resistance-tools-mcp@resistance-tools/);
assert.match(readme, /codex mcp add resistance-tools-mcp --url https:\/\/app\.resistance\.dog\/api\/mcp/);
assert.match(readme, /codex mcp login resistance-tools-mcp/);
assert.match(readme, /codex plugin remove resistance-tools@resistance-tools/);
assert.match(readme, /codex plugin marketplace upgrade resistance-tools/);
assert.match(readme, /claude plugin uninstall resistance-tools@resistance-tools/);
assert.match(readme, /claude plugin marketplace update resistance-tools/);
assert.match(readme, /claude mcp add --transport http resistance-tools-mcp/);
assert.match(readme, /tools only; they do not install the bundled skills/i);
assert.match(readme, /`main` is the stable branch used for installation and releases\. Development happens on `dev`\./);
assert.match(skill, /codex mcp add resistance-tools-mcp --url https:\/\/app\.resistance\.dog\/api\/mcp/);
assert.match(releaseWorkflow, /test "\$GITHUB_REF" = "refs\/heads\/main"/);
assert.doesNotMatch(releaseWorkflow, /refs\/heads\/dev/);

const publicGuidance = [readme, skill, openAiMetadata, ...references.values()].join("\n");
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
  assert.ok(references.get("sites").includes(marker), `site result contract missing ${marker}`);
}
for (const state of ["prepared", "awaiting confirmation", "submitted", "confirmed", "published", "live"]) {
  assert.ok(publicGuidance.includes(state), `guidance missing state ${state}`);
}
assert.match(skill, /operationId.*MCP confirmation request/i);
assert.match(skill, /Do not enumerate the user's wallet, sites, domains, Bags, collections, or items/i);
assert.match(skill, /Never create a throwaway project as an intermediate step/i);
assert.doesNotMatch(references.get("sites"), /Read `sites\.list` before a mutation/i);
assert.doesNotMatch(references.get("wallet"), /Use `wallet\.me` before owner-sensitive work/i);
assert.match(references.get("storage"), /Never pass the transaction request's `operationId`/i);
assert.match(skill, /Do not add boilerplate explaining that the agent cannot sign/i);
assert.match(skill, /Let the user select permissions/i);

console.log("1 Agent Skill, 5 focused references, 46 live tools, and cross-client plugin metadata are aligned");
