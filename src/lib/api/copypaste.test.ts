import { describe, it, expect, vi } from "vitest";
import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  ContentState,
  RawDraftContentState,
} from "draft-js";
import {
  registerCopySource,
  onDraftEditorCopy,
  onDraftEditorCut,
  handleDraftEditorPastedText,
  getDraftEditorPastedContent,
} from "./copypaste";

vi.mock("draft-js/lib/getDraftEditorSelection", () => ({
  default: () => ({}),
}));
vi.mock("draft-js/lib/getContentStateFragment", () => ({
  default: (content: ContentState) => content.getBlockMap(),
}));
vi.mock("draft-js/lib/editOnCopy", () => ({ default: vi.fn() }));
vi.mock("draft-js/lib/editOnCut", () => ({ default: vi.fn() }));

const dispatchEvent = (
  editor: HTMLElement,
  type: string,
  setData?: (type: string, data: string) => void,
) => {
  const event = Object.assign(new Event(type), {
    clipboardData: { setData },
    preventDefault: vi.fn(),
  });

  editor.dispatchEvent(event);

  return event;
};

const getSelection = (selection?: Selection) => {
  return vi.fn(() =>
    Object.assign(
      {
        rangeCount: 0,
        toString: () => "toString selection",
        getRangeAt() {
          return {
            cloneContents() {
              return document.createElement("div");
            },
          };
        },
      },
      selection,
    ),
  );
};

describe("copypaste", () => {
  describe("registerCopySource", () => {
    it("registers and unregisters works for copy", () => {
      const editor = document.createElement("div");

      const copySource = registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = getSelection();
      dispatchEvent(editor, "copy");
      expect(window.getSelection).toHaveBeenCalled();

      copySource.unregister();

      window.getSelection = getSelection();
      dispatchEvent(editor, "cut");
      expect(window.getSelection).not.toHaveBeenCalled();
    });

    it("works for cut", () => {
      const editor = document.createElement("div");

      const copySource = registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = getSelection();
      dispatchEvent(editor, "cut");
      expect(window.getSelection).toHaveBeenCalled();

      copySource.unregister();

      window.getSelection = getSelection();
      dispatchEvent(editor, "cut");
      expect(window.getSelection).not.toHaveBeenCalled();
    });
  });

  describe("onDraftEditorCopy", () => {
    it("calls editOnCopy", () => {
      const editor = document.createElement("div");
      window.getSelection = getSelection();
      // @ts-expect-error - Partial browser or editor fixture.
      onDraftEditorCopy(editor, dispatchEvent(editor, "copy"));
    });
  });

  describe("onDraftEditorCut", () => {
    it("does not break", () => {
      const editor = document.createElement("div");
      window.getSelection = getSelection();
      // @ts-expect-error - Partial browser or editor fixture.
      onDraftEditorCut(editor, dispatchEvent(editor, "cut"));
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
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = getSelection();

      const event = dispatchEvent(editor, "copy");
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("no clipboardData, IE11", () => {
      const editor = document.createElement("div");

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createEmpty(),
      });

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({ rangeCount: 1 });

      const event = new Event("copy");
      event.preventDefault = vi.fn();
      editor.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("works", () => {
      expect.assertions(2);
      const editor = document.createElement("div");

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "test",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({ rangeCount: 1 });

      dispatchEvent(editor, "copy", (type: string, data: string) => {
        if (type === "text/plain") {
          expect(data).toBe("toString selection");
        } else if (type === "text/html") {
          expect(data).toMatchSnapshot();
        }
      });
    });

    it("uses the default copy-paste behavior if content is empty", () => {
      const editor = document.createElement("div");

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({ rangeCount: 1 });

      const event = dispatchEvent(editor, "copy", () => {});
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("supports copy-pasting from decorators content", () => {
      const editor = document.createElement("div");

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      const contents = document.createElement("div");
      contents.setAttribute("data-contents", "true");
      const decorator = document.createElement("div");
      decorator.setAttribute("contenteditable", "false");
      contents.appendChild(decorator);
      const anchorNode = document.createElement("div");
      decorator.appendChild(anchorNode);
      const focusNode = document.createElement("div");
      anchorNode.appendChild(focusNode);

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({
        rangeCount: 1,
        anchorNode,
        focusNode,
      });

      const event = dispatchEvent(editor, "copy", () => {});
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("supports copy-pasting from decorators content #2", () => {
      const editor = document.createElement("div");

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      const contents = document.createElement("div");
      contents.setAttribute("data-contents", "true");
      const focusDecorator = document.createElement("div");
      focusDecorator.setAttribute("contenteditable", "false");
      contents.appendChild(focusDecorator);
      const anchorDecorator = document.createElement("div");
      anchorDecorator.setAttribute("contenteditable", "false");
      contents.appendChild(anchorDecorator);
      const anchorNode = document.createElement("div");
      const focusNode = document.createElement("div");
      anchorDecorator.appendChild(anchorNode);
      focusDecorator.appendChild(focusNode);
      focusDecorator.appendChild(anchorDecorator);

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({
        rangeCount: 1,
        anchorNode,
        focusNode,
      });

      const event = dispatchEvent(editor, "copy", () => {});
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("supports pasting from text nodes only", () => {
      const editor = document.createElement("div");

      const content = {
        blocks: [
          {
            key: "a",
            type: "unstyled",
            text: "",
          },
        ],
        entityMap: {},
      } as RawDraftContentState;

      registerCopySource({
        editor,
        // @ts-expect-error - Partial editor fixture includes the private state field.
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      const contents = document.createElement("div");
      contents.setAttribute("data-contents", "true");
      const decorator = document.createElement("div");
      decorator.setAttribute("contenteditable", "false");
      contents.appendChild(decorator);
      const anchorParent = document.createElement("div");
      decorator.appendChild(anchorParent);
      const anchorNode = document.createTextNode("this is text");
      anchorParent.appendChild(anchorNode);
      const focusNode = document.createTextNode("this is text");
      anchorParent.appendChild(focusNode);

      // @ts-expect-error - Partial browser or editor fixture.
      window.getSelection = getSelection({
        rangeCount: 1,
        anchorNode,
        focusNode,
      });

      const event = dispatchEvent(editor, "copy", () => {});
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  it("checks whether anchor node is indeed in a decorator", () => {
    const editor = document.createElement("div");

    const content = {
      blocks: [
        {
          key: "a",
          type: "unstyled",
          text: "",
        },
      ],
      entityMap: {},
    } as RawDraftContentState;

    registerCopySource({
      editor,
      // @ts-expect-error - Partial editor fixture includes the private state field.
      _latestEditorState: EditorState.createWithContent(
        convertFromRaw(content),
      ),
    });

    const contents = document.createElement("div");
    contents.setAttribute("data-contents", "true");
    const decorator = document.createElement("div");
    decorator.setAttribute("contenteditable", "false");
    contents.appendChild(decorator);
    const anchorNode = document.createElement("div");
    decorator.appendChild(anchorNode);
    const focusNode = document.createElement("div");
    // focusNode.appendChild(anchorNode);

    // @ts-expect-error - Partial browser or editor fixture.
    window.getSelection = getSelection({
      rangeCount: 1,
      anchorNode,
      focusNode,
    });

    const event = dispatchEvent(editor, "copy", () => {});
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("checks whether focus node is indeed in a decorator", () => {
    const editor = document.createElement("div");

    const content = {
      blocks: [
        {
          key: "a",
          type: "unstyled",
          text: "",
        },
      ],
      entityMap: {},
    } as RawDraftContentState;

    registerCopySource({
      editor,
      // @ts-expect-error - Partial editor fixture includes the private state field.
      _latestEditorState: EditorState.createWithContent(
        convertFromRaw(content),
      ),
    });

    const contents = document.createElement("div");
    contents.setAttribute("data-contents", "true");
    const decorator = document.createElement("div");
    decorator.setAttribute("contenteditable", "false");
    contents.appendChild(decorator);
    const anchorNode = document.createElement("div");
    const focusNode = document.createElement("div");
    focusNode.appendChild(anchorNode);

    // @ts-expect-error - Partial browser or editor fixture.
    window.getSelection = getSelection({
      rangeCount: 1,
      anchorNode,
      focusNode,
    });

    const event = dispatchEvent(editor, "copy", () => {});
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  describe("handleDraftEditorPastedText", () => {
    it("no HTML", () => {
      const editorState = EditorState.createEmpty();
      expect(handleDraftEditorPastedText(undefined, editorState)).toBe(false);
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
      let editorState = EditorState.createWithContent(
        convertFromRaw({
          ...content,
          blocks: [{ ...content.blocks[0], text: "" }],
        }),
      );
      const html = `<div data-draftjs-conductor-fragment='${JSON.stringify(
        content,
      )}'><p>Hello, world!</p></div>`;
      editorState = handleDraftEditorPastedText(
        html,
        editorState,
      ) as EditorState;
      expect(convertToRaw(editorState.getCurrentContent())).toEqual(content);
    });

    it("invalid JSON", () => {
      const editorState = EditorState.createEmpty();
      const html = `<div data-draftjs-conductor-fragment='{"blocks":[{"key"'><p>Hello, world!</p></div>`;
      expect(handleDraftEditorPastedText(html, editorState)).toBe(false);
    });
  });

  describe("getDraftEditorPastedContent", () => {
    it("no HTML", () => {
      expect(getDraftEditorPastedContent(undefined)).toEqual(null);
    });

    it("HTML from other app", () => {
      expect(getDraftEditorPastedContent("<p>Hello, world!</p>")).toEqual(null);
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
      } as RawDraftContentState;
      const html = `<div data-draftjs-conductor-fragment='${JSON.stringify(
        content,
      )}'><p>Hello, world!</p></div>`;
      const pastedContent = getDraftEditorPastedContent(html) as ContentState;
      expect(convertToRaw(pastedContent)).toEqual(content);
    });

    it("invalid JSON", () => {
      const html = `<div data-draftjs-conductor-fragment='{"blocks":[{"key"'><p>Hello, world!</p></div>`;
      expect(getDraftEditorPastedContent(html)).toBe(null);
    });
  });
});
