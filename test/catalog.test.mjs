import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { expectedToolContracts } from "../scripts/catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = async (path) => JSON.parse(await read(path));
const referenceNames = ["domains", "sites", "storage", "transactions", "wallet"];

test("repository packages the current remote MCP for Codex and Claude Code", async () => {
  const pkg = await readJson("package.json");
  const catalog = await readJson("catalog/mcp.json");
  const registry = await readJson("server.json");
  const codexPlugin = await readJson(".codex-plugin/plugin.json");
  const claudePlugin = await readJson(".claude-plugin/plugin.json");
  const mcp = await readJson(".mcp.json");

  assert.equal(pkg.private, true);
  assert.equal(pkg.version, "0.2.2");
  assert.equal(catalog.serverVersion, pkg.version);
  assert.equal(registry.version, pkg.version);
  assert.equal(codexPlugin.version, pkg.version);
  assert.equal(claudePlugin.version, pkg.version);
  assert.equal(registry.name, "io.github.TONresistor/resistance-tools-mcp");
  assert.deepEqual(registry.remotes, [{ type: "streamable-http", url: catalog.endpoint }]);
  assert.deepEqual(mcp, {
    mcpServers: {
      "resistance-tools-mcp": { type: "http", url: catalog.endpoint },
    },
  });
  assert.equal(codexPlugin.skills, "./skills/");
  assert.equal(codexPlugin.mcpServers, "./.mcp.json");
  assert.equal(codexPlugin.name, "resistance-tools-mcp");
  assert.equal(claudePlugin.name, "resistance-tools-mcp");
  assert.deepEqual(catalog.remoteTools, expectedToolContracts);
  assert.equal(catalog.remoteTools.length, 46);
});

test("plugin exposes one Agent Skill with five bundled references", async () => {
  const directories = (await readdir(new URL("../skills/", import.meta.url), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(directories, ["resistance-tools-skill"]);

  const skill = await read("skills/resistance-tools-skill/SKILL.md");
  const metadata = await read("skills/resistance-tools-skill/agents/openai.yaml");
  assert.match(skill, /^---\nname: resistance-tools-skill\ndescription: [^\n]+\n---\n/);
  assert.match(metadata, /\$resistance-tools-skill/);
  assert.match(metadata, /value: "resistance-tools-mcp"/);
  const readme = await read("README.md");
  assert.match(readme, /invoked as `\$resistance-tools-skill`/i);
  assert.match(skill, /Do not enumerate the user's wallet, sites, domains, Bags, collections, or items/i);
  assert.match(skill, /Never create a throwaway project as an intermediate step/i);
  for (const name of referenceNames) {
    assert.ok(skill.includes(`[references/${name}.md](references/${name}.md)`));
  }
});

test("the five references cover every remote tool exactly once", async () => {
  const methods = [];
  for (const name of referenceNames) {
    const doc = await read(`skills/resistance-tools-skill/references/${name}.md`);
    const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
    for (let index = 0; index < headings.length; index += 1) {
      const section = doc.slice(headings[index].index, headings[index + 1]?.index ?? doc.length);
      methods.push(headings[index][1]);
      for (const marker of ["**Permission:**", "**Input:**", "**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
        assert.ok(section.includes(marker), `${name}.md ${headings[index][1]} missing ${marker}`);
      }
    }
  }

  assert.equal(methods.length, 46);
  assert.equal(new Set(methods).size, 46);
  assert.deepEqual(methods.sort(), expectedToolContracts.map(({ name }) => name).sort());
});
