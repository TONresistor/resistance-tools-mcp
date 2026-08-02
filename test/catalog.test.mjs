import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { expectedToolContracts } from "../scripts/catalog-contract.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

test("repository describes the current remote-only MCP server", async () => {
  const pkg = await readJson("package.json");
  const catalog = await readJson("catalog/mcp.json");
  const registry = await readJson("server.json");

  assert.equal(pkg.private, true);
  assert.equal(pkg.version, "0.2.0");
  assert.equal(catalog.serverVersion, pkg.version);
  assert.equal(registry.version, pkg.version);
  assert.equal(registry.name, "io.github.TONresistor/resistance-tools-mcp");
  assert.deepEqual(registry.remotes, [{ type: "streamable-http", url: catalog.endpoint }]);
  assert.equal("packages" in registry, false);
  assert.equal("bin" in pkg, false);
  assert.deepEqual(catalog.remoteTools, expectedToolContracts);
  assert.equal(catalog.remoteTools.length, 46);
  assert.equal(catalog.resources.length, 5);
  assert.equal(catalog.templates.length, 6);
});

test("every remote tool has one complete agent method", async () => {
  const paths = [
    "docs/core-methods.md",
    "docs/sites-methods.md",
    "docs/dns-methods.md",
    "docs/subdomains-methods.md",
    "docs/storage-methods.md",
  ];
  const methods = [];
  for (const path of paths) {
    const doc = await read(path);
    const headings = [...doc.matchAll(/^### `([^`]+)`$/gm)];
    for (let index = 0; index < headings.length; index += 1) {
      const section = doc.slice(headings[index].index, headings[index + 1]?.index ?? doc.length);
      methods.push(headings[index][1]);
      for (const marker of ["**Use:**", "**Method:**", "**Verify:**", "**Report:**"]) {
        assert.ok(section.includes(marker), `${path} ${headings[index][1]} missing ${marker}`);
      }
    }
  }

  assert.equal(methods.length, 46);
  assert.equal(new Set(methods).size, 46);
  assert.deepEqual(methods.sort(), expectedToolContracts.map(({ name }) => name).sort());
});
