import { EditorState, convertFromRaw } from "draft-js";

import DraftUtils from "./DraftUtils";

describe("DraftUtils", () => {
  describe("#addLineBreak", () => {
    it("works, collapsed", () => {
      const contentState = convertFromRaw({
        entityMap: {},
        blocks: [
          {
            key: "b0ei9",
            text: "test",
            type: "header-two",
          },
        ],
      });
      const editorState = EditorState.createWithContent(contentState);

      expect(
        DraftUtils.addLineBreak(editorState)
          .getCurrentContent()
          .getFirstBlock()
          .getText(),
      ).toBe("\ntest");
    });

    it("works, non-collapsed", () => {
      const contentState = convertFromRaw({
        entityMap: {},
        blocks: [
          {
            key: "a",
            text: "test",
            type: "header-two",
          },
        ],
      });
      let editorState = EditorState.createWithContent(contentState);
      const selection = editorState.getSelection().merge({
        anchorKey: "a",
        focusKey: "a",
        anchorOffset: 0,
        focusOffset: 2,
      });
      editorState = EditorState.forceSelection(editorState, selection);

      expect(
        DraftUtils.addLineBreak(editorState)
          .getCurrentContent()
          .getFirstBlock()
          .getText(),
      ).toBe("\nst");
    });
  });
});
