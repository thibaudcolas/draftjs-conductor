import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  ContentState,
} from "draft-js";
import {
  registerCopySource,
  handleDraftEditorPastedText,
  getSelectedContent,
} from "./copypaste";

jest.mock("draft-js/lib/generateRandomKey", () => () => "a");
jest.mock("draft-js/lib/getDraftEditorSelection", () => () => ({}));
jest.mock("draft-js/lib/getContentStateFragment", () => () => ({
  toArray() {},
}));

const dispatchEvent = (editor, type, setData) => {
  const event = Object.assign(new Event(type), {
    clipboardData: { setData },
    preventDefault: jest.fn(),
  });

  editor.dispatchEvent(event);

  return event;
};

describe("copypaste", () => {
  describe("registerCopySource", () => {
    it("registers and unregisters works for copy", () => {
      const editor = document.createElement("div");

      const copySource = registerCopySource({
        editor,
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = jest.fn(() => ({ rangeCount: 0 }));
      dispatchEvent(editor, "copy");
      expect(window.getSelection).toHaveBeenCalled();

      copySource.unregister();

      window.getSelection = jest.fn(() => ({ rangeCount: 0 }));
      dispatchEvent(editor, "cut");
      expect(window.getSelection).not.toHaveBeenCalled();
    });

    it("works for cut", () => {
      const editor = document.createElement("div");

      const copySource = registerCopySource({
        editor,
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = jest.fn(() => ({ rangeCount: 0 }));
      dispatchEvent(editor, "cut");
      expect(window.getSelection).toHaveBeenCalled();

      copySource.unregister();

      window.getSelection = jest.fn(() => ({ rangeCount: 0 }));
      dispatchEvent(editor, "cut");
      expect(window.getSelection).not.toHaveBeenCalled();
    });
  });

  /**
   * jsdom does not implement the DOM selection API, we have to do a lot of overriding.
   */
  describe("copy/cut listener", () => {
    it("no selection", () => {
      const editor = document.createElement("div");

      registerCopySource({
        editor,
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = jest.fn(() => {
        return {
          rangeCount: 0,
        };
      });

      const event = dispatchEvent(editor, "copy");
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("no clipboardData, IE11", () => {
      const editor = document.createElement("div");

      registerCopySource({
        editor,
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = jest.fn(() => {
        return {
          rangeCount: 1,
        };
      });

      const event = new Event("copy");
      event.preventDefault = jest.fn();
      editor.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("works", (done) => {
      const editor = document.createElement("div");

      registerCopySource({
        editor,
        _latestEditorState: EditorState.createEmpty(),
      });

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "test",
          },
        ],
        entityMap: {},
      };

      jest
        .spyOn(ContentState, "createFromBlockArray")
        .mockImplementationOnce(() => {
          return convertFromRaw(content);
        });

      window.getSelection = jest.fn(() => {
        return {
          rangeCount: 1,
          toString: () => "toString selection",
          getRangeAt() {
            return {
              cloneContents() {
                return document.createElement("div");
              },
            };
          },
        };
      });

      dispatchEvent(editor, "copy", (type, data) => {
        if (type === "text/plain") {
          expect(data).toBe("toString selection");
        } else if (type === "text/html") {
          expect(data).toMatchSnapshot();
          done();
        }
      });
    });
  });

  describe("handleDraftEditorPastedText", () => {
    it("no HTML", () => {
      const editorState = EditorState.createEmpty();
      expect(handleDraftEditorPastedText(null, editorState)).toBe(false);
    });

    it("HTML from other app", () => {
      const editorState = EditorState.createEmpty();
      const html = `<p>Hello, world!</p>`;
      expect(handleDraftEditorPastedText(html, editorState)).toBe(false);
    });

    it("HTML from draftjs-conductor", () => {
      const content = {
        blocks: [
          {
            data: {},
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [],
            key: "a",
            text: "hello,\nworld!",
            type: "unstyled",
          },
        ],
        entityMap: {},
      };
      let editorState = EditorState.createEmpty();
      const html = `<div data-draftjs-conductor-fragment='${JSON.stringify(
        content,
      )}'><p>Hello, world!</p></div>`;
      editorState = handleDraftEditorPastedText(html, editorState);
      expect(convertToRaw(editorState.getCurrentContent())).toEqual(content);
    });

    it("invalid JSON", () => {
      const editorState = EditorState.createEmpty();
      const html = `<div data-draftjs-conductor-fragment='{"blocks":[{"key"'><p>Hello, world!</p></div>`;
      expect(handleDraftEditorPastedText(html, editorState)).toBe(false);
    });
  });
});
