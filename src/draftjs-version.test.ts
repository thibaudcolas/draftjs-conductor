import { createRequire } from "node:module";
import { describe, it, expect } from "vitest";
import { EditorState } from "draft-js";
// @ts-expect-error - Draft.js does not publish types for its internal modules.
import getContentStateFragment from "draft-js/lib/getContentStateFragment";

const require = createRequire(import.meta.url);
const version = process.env.DRAFTJS_VERSION || "0.11";
const packageName = version === "0.10" ? "draft-js-10" : "draft-js";

describe(`Draft.js ${version} compatibility`, () => {
  it("loads the selected version's public API", () => {
    expect(require(`${packageName}/package.json`).version).toBe(
      version === "0.10" ? "0.10.5" : "0.11.7",
    );
    expect(EditorState).toBe(require(packageName).EditorState);
  });

  it("loads the selected version's internal modules", () => {
    expect(getContentStateFragment).toBe(
      require(`${packageName}/lib/getContentStateFragment`),
    );
  });
});
