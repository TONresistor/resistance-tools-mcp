import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const catalog = JSON.parse(await read("catalog/mcp.json"));
const pkg = JSON.parse(await read("package.json"));
const bridge = await read("bin/resistance-tools-mcp.mjs");
const readme = await read("README.md");
const skill = await read("SKILL.md");
const toolsDoc = await read("docs/tools.md");
const templatesDoc = await read("docs/templates.md");
const authDoc = await read("docs/auth.md");

const expectedTools = [
  "auth.status", "auth.policy", "wallet.me", "mcp.access.list", "mcp.audit.list",
  "mcp.audit.summary", "mcp.access.revoke_consent", "sites.list", "sites.get_content",
  "sites.list_releases", "sites.publish_files", "sites.publish_template", "sites.rollback",
  "sites.delete", "deployments.list", "dns.lookup", "domains.list", "domains.records",
  "dns.prepare_record_tx", "dns.prepare_site_record_tx", "media.upload_image",
  "storage.list_bags", "storage.bag_details", "storage.create_bag", "storage.pin_bag",
  "storage.delete_bag",
];
const expectedResources = [
  "tonsite://wallet", "tonsite://sites", "tonsite://deployments", "tonsite://domains", "tonsite://bags",
];
const expectedTemplates = ["links", "blog", "redirect", "token", "sale", "tip"];

assert.equal(pkg.name, "@resistance-tools/mcp");
assert.equal(pkg.version, catalog.bridgeVersion);
assert.equal(catalog.serverVersion, "0.2.0");
assert.deepEqual(catalog.remoteTools.map(({ name }) => name), expectedTools);
assert.deepEqual(catalog.resources.map(({ uri }) => uri), expectedResources);
assert.deepEqual(catalog.templates, expectedTemplates);
assert.equal(new Set(catalog.remoteTools.map(({ name }) => name)).size, 26);
assert.equal(new Set(catalog.bridgeTools).size, 6);
assert.match(bridge, /"media:write"/);
assert.equal((bridge.match(/version: "0\.2\.0"/g) ?? []).length, 2);

for (const name of expectedTools) assert.ok(toolsDoc.includes(`\`${name}\``), `docs/tools.md missing ${name}`);
for (const uri of expectedResources) assert.ok(readme.includes(`\`${uri}\``), `README.md missing ${uri}`);
for (const template of expectedTemplates) assert.ok(templatesDoc.includes(`\`${template}\``), `docs/templates.md missing ${template}`);
for (const scope of new Set(catalog.remoteTools.map(({ scope }) => scope).filter((scope) => scope !== "public"))) {
  assert.ok(authDoc.includes(`\`${scope}\``), `docs/auth.md missing ${scope}`);
}
for (const text of [readme, skill, toolsDoc, templatesDoc, authDoc]) {
  assert.ok(!text.includes("@resistance/resistance-tools-mcp"), "stale npm package name");
}
assert.match(readme, /26 remote tools/);
assert.match(readme, /5 fixed resources/);
assert.match(readme, /6 templates/);

console.log("catalog and documentation are aligned");
