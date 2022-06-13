import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  CompositeDecorator,
  RawDraftContentState,
} from "draft-js";
import {
  createEditorStateFromRaw,
  serialiseEditorStateToRaw,
} from "./conversion";

describe("#createEditorStateFromRaw", () => {
  it("creates state from real content", () => {
    const state = createEditorStateFromRaw({
      entityMap: {},
      blocks: [
        { text: "Hello, World!", type: "unstyled" },
        { text: "This is a title", type: "header-two" },
      ],
    } as RawDraftContentState);
    const result = convertToRaw(state.getCurrentContent());
    expect(state).toBeInstanceOf(EditorState);
    expect(result.blocks.length).toEqual(2);
    expect(result.blocks[0].text).toEqual("Hello, World!");
  });

  it("creates empty state from empty content", () => {
    const state = createEditorStateFromRaw(null);
    const result = convertToRaw(state.getCurrentContent());
    expect(state).toBeInstanceOf(EditorState);
    expect(result.blocks.length).toEqual(1);
    expect(result.blocks[0].text).toEqual("");
  });

  it("takes a decorator", () => {
    const decorator = new CompositeDecorator([
      { strategy: () => {}, component: () => {} },
    ]);
    const state = createEditorStateFromRaw(null, decorator);
    expect(state.getDecorator()).toBe(decorator);
  });
});

describe("#serialiseEditorStateToRaw", () => {
  it("keeps real content", () => {
    const stubContent = {
      entityMap: {},
      blocks: [
        {
          key: "1dcqo",
          text: "Hello, World!",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "dmtba",
          text: "This is a title",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    } as RawDraftContentState;
    const state = createEditorStateFromRaw(stubContent);
    expect(serialiseEditorStateToRaw(state)).toEqual(stubContent);
  });

  it("discards empty content", () => {
    const state = createEditorStateFromRaw(null);
    expect(serialiseEditorStateToRaw(state)).toBeNull();
  });

  it("discards content with only empty text", () => {
    const editorState = EditorState.createWithContent(
      convertFromRaw({
        entityMap: {},
        blocks: [
          {
            key: "a",
            text: "",
          },
        ],
      } as RawDraftContentState),
    );
    expect(serialiseEditorStateToRaw(editorState)).toBeNull();
  });
});
