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

jest.mock("draft-js/lib/generateRandomKey", () => () => "a");
jest.mock("draft-js/lib/getDraftEditorSelection", () => () => ({}));
jest.mock(
  "draft-js/lib/getContentStateFragment",
  () => (content: ContentState) => content.getBlockMap(),
);

jest.mock("draft-js/lib/editOnCopy", () => jest.fn(() => {}));
jest.mock("draft-js/lib/editOnCut", () => jest.fn(() => {}));

jest.mock("draft-js-10/lib/generateRandomKey", () => () => "a");
jest.mock("draft-js-10/lib/getDraftEditorSelection", () => () => ({}));
jest.mock(
  "draft-js-10/lib/getContentStateFragment",
  () => (content: ContentState) => content.getBlockMap(),
);
jest.mock("draft-js-10/lib/editOnCopy", () => jest.fn(() => {}));
jest.mock("draft-js-10/lib/editOnCut", () => jest.fn(() => {}));

const dispatchEvent = (
  editor: HTMLElement,
  type: string,
  setData?: { [key: string]: any },
) => {
  const event = Object.assign(new Event(type), {
    clipboardData: { setData },
    preventDefault: jest.fn(),
  });

  editor.dispatchEvent(event);

  return event;
};

const getSelection = (selection?: Selection) => {
  return jest.fn(() =>
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
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
      // @ts-expect-error
      onDraftEditorCopy(editor, dispatchEvent(editor, "copy"));
    });
  });

  describe("onDraftEditorCut", () => {
    it("does not break", () => {
      const editor = document.createElement("div");
      window.getSelection = getSelection();
      // @ts-expect-error
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
        _latestEditorState: EditorState.createEmpty(),
      });

      window.getSelection = getSelection();

      const event = dispatchEvent(editor, "copy");
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("no clipboardData, IE11", () => {
      const editor = document.createElement("div");

      registerCopySource({
        // @ts-expect-error
        editor,
        // @ts-expect-error
        _latestEditorState: EditorState.createEmpty(),
      });

      // @ts-expect-error
      window.getSelection = getSelection({ rangeCount: 1 });

      const event = new Event("copy");
      event.preventDefault = jest.fn();
      editor.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("works", (done) => {
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      // @ts-expect-error
      window.getSelection = getSelection({ rangeCount: 1 });

      dispatchEvent(editor, "copy", (type: string, data: any) => {
        if (type === "text/plain") {
          expect(data).toBe("toString selection");
        } else if (type === "text/html") {
          expect(data).toMatchSnapshot();
          done();
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
        _latestEditorState: EditorState.createWithContent(
          convertFromRaw(content),
        ),
      });

      // @ts-expect-error
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
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

      // @ts-expect-error
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
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

      // @ts-expect-error
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
        // @ts-expect-error
        editor,
        // @ts-expect-error
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

      // @ts-expect-error
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
      // @ts-expect-error
      editor,
      // @ts-expect-error
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

    // @ts-expect-error
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
      // @ts-expect-error
      editor,
      // @ts-expect-error
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

    // @ts-expect-error
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
      let editorState = EditorState.createEmpty();
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
