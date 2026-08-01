import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("package identity, bridge version and media scope match the catalog", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const catalog = JSON.parse(await read("catalog/mcp.json"));
  const bridge = await read("bin/resistance-tools-mcp.mjs");

  assert.equal(pkg.name, "@resistance-tools/mcp");
  assert.equal(pkg.version, "0.2.0");
  assert.equal(catalog.bridgeVersion, pkg.version);
  assert.equal(catalog.serverVersion, "0.2.0");
  assert.equal(catalog.remoteTools.length, 26);
  assert.equal(catalog.resources.length, 5);
  assert.equal(catalog.templates.length, 6);
  assert.ok(catalog.remoteTools.some(({ name, scope }) => name === "media.upload_image" && scope === "media:write"));
  assert.match(bridge, /"media:write"/);
  assert.equal((bridge.match(/version: "0\.2\.0"/g) ?? []).length, 2);
});
