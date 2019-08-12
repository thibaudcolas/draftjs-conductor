import {
  ListNestingStyles,
  DRAFT_DEFAULT_MAX_DEPTH,
  DRAFT_DEFAULT_DEPTH_CLASS,
  generateListNestingStyles,
  blockDepthStyleFn,
  registerCopySource,
  handleDraftEditorPastedText,
  createEditorStateFromRaw,
  serialiseEditorStateToRaw,
} from "./index";

const pkg = require("../../package.json");

/**
 * Makes sure the API shape is validated against.
 */
describe(pkg.name, () => {
  it("ListNestingStyles", () => expect(ListNestingStyles).toBeDefined());

  it("DRAFT_DEFAULT_MAX_DEPTH", () =>
    expect(DRAFT_DEFAULT_MAX_DEPTH).toBeDefined());

  it("DRAFT_DEFAULT_DEPTH_CLASS", () =>
    expect(DRAFT_DEFAULT_DEPTH_CLASS).toBeDefined());

  it("generateListNestingStyles", () =>
    expect(generateListNestingStyles).toBeDefined());

  it("blockDepthStyleFn", () => expect(blockDepthStyleFn).toBeDefined());

  it("registerCopySource", () => expect(registerCopySource).toBeDefined());

  it("handleDraftEditorPastedText", () =>
    expect(handleDraftEditorPastedText).toBeDefined());

  it("createEditorStateFromRaw", () =>
    expect(createEditorStateFromRaw).toBeDefined());

  it("serialiseEditorStateToRaw", () =>
    expect(serialiseEditorStateToRaw).toBeDefined());
});
