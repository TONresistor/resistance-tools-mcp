import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { expectedToolContracts } from "../scripts/catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

const skillNames = ["domains", "sites", "storage", "transactions", "wallet"];

test("repository packages the current remote MCP for Codex and Claude Code", async () => {
  const pkg = await readJson("package.json");
  const catalog = await readJson("catalog/mcp.json");
  const registry = await readJson("server.json");
  const codexPlugin = await readJson(".codex-plugin/plugin.json");
  const claudePlugin = await readJson(".claude-plugin/plugin.json");
  const mcp = await readJson(".mcp.json");

  assert.equal(pkg.private, true);
  assert.equal(pkg.version, "0.2.0");
  assert.equal(catalog.serverVersion, pkg.version);
  assert.equal(registry.version, pkg.version);
  assert.equal(codexPlugin.version, pkg.version);
  assert.equal(claudePlugin.version, pkg.version);
  assert.equal(registry.name, "io.github.TONresistor/resistance-tools-mcp");
  assert.deepEqual(registry.remotes, [{ type: "streamable-http", url: catalog.endpoint }]);
  assert.deepEqual(mcp, {
    mcpServers: {
      "resistance-tools": { type: "http", url: catalog.endpoint },
    },
  });
  assert.equal(codexPlugin.skills, "./skills/");
  assert.equal(codexPlugin.mcpServers, "./.mcp.json");
  assert.equal(codexPlugin.name, "resistance-tools");
  assert.equal(claudePlugin.name, "resistance-tools");
  assert.deepEqual(catalog.remoteTools, expectedToolContracts);
  assert.equal(catalog.remoteTools.length, 46);
  assert.equal(catalog.resources.length, 5);
  assert.equal(catalog.templates.length, 6);
});

test("plugin exposes exactly the five focused Agent Skills", async () => {
  const directories = (await readdir(new URL("../skills/", import.meta.url), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(directories, skillNames);

  for (const name of skillNames) {
    const skill = await read(`skills/${name}/SKILL.md`);
    const metadata = await read(`skills/${name}/agents/openai.yaml`);
    assert.match(skill, new RegExp(`^---\\nname: ${name}\\ndescription: [^\\n]+\\n---\\n`));
    assert.ok(skill.includes("[references/tools.md](references/tools.md)"));
    assert.match(metadata, new RegExp(`\\$${name}`));
    assert.match(metadata, /value: "resistance-tools"/);
  }
});

test("every remote tool has one complete skill method", async () => {
  const methods = [];
  for (const name of skillNames) {
    const doc = await read(`skills/${name}/references/tools.md`);
    const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
    for (let index = 0; index < headings.length; index += 1) {
      const section = doc.slice(headings[index].index, headings[index + 1]?.index ?? doc.length);
      methods.push(headings[index][1]);
      for (const marker of ["**Permission:**", "**Input:**", "**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
        assert.ok(section.includes(marker), `${name} ${headings[index][1]} missing ${marker}`);
      }
    }
  }

  assert.equal(methods.length, 46);
  assert.equal(new Set(methods).size, 46);
  assert.deepEqual(methods.sort(), expectedToolContracts.map(({ name }) => name).sort());
});
