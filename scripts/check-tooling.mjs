import assert from "node:assert/strict";
import { createRequire } from "node:module";

const load = createRequire(import.meta.url);
const pkg = load("../package.json");
const vp = load("vite-plus/package.json");
const fromVp = createRequire(load.resolve("vite-plus/package.json"));

for (const name of ["vite", "vitest"]) {
  assert.equal(
    pkg.devDependencies[name],
    vp.dependencies[name],
    `${name} must match the version bundled with vite-plus`,
  );
  assert.equal(
    pkg.overrides[name],
    pkg.devDependencies[name],
    `${name} override must match the direct dependency`,
  );
  assert.equal(
    load(`${name}/package.json`).version,
    fromVp(`${name}/package.json`).version,
    `${name} must resolve to the same version inside and outside vite-plus`,
  );
}
assert.equal(
  pkg.devDependencies["@vitest/coverage-v8"],
  vp.dependencies.vitest,
  "The coverage provider must match Vite Plus's bundled Vitest",
);
// Legacy Draft.js loads isomorphic-fetch through fbjs. Check its Node entry
// point too: browser tests otherwise miss an incompatible node-fetch override.
const fromFetch = createRequire(load.resolve("isomorphic-fetch"));
assert.equal(typeof fromFetch("node-fetch"), "function");
console.log("Tooling versions and legacy fetch compatibility verified.");
