import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { expectedToolContracts } from "../scripts/catalog-contract.mjs";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));

test("repository describes one remote-only MCP server", async () => {
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
  assert.equal(catalog.resources.length, 5);
  assert.equal(catalog.templates.length, 6);
});
