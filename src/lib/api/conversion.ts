import {
  EditorState,
  convertFromRaw,
  convertToRaw,
  RawDraftContentState,
  ContentBlock,
  ContentState,
} from "draft-js";

const EMPTY_CONTENT_STATE = null;

interface DraftDecoratorType {
  /**
   * Given a `ContentBlock`, return an immutable List of decorator keys.
   */
  getDecorations(
    block: ContentBlock,
    contentState: ContentState,
  ): Immutable.List<string>;

  /**
   * Given a decorator key, return the component to use when rendering
   * this decorated range.
   */
  getComponentForKey(key: string): Function;

  /**
   * Given a decorator key, optionally return the props to use when rendering
   * this decorated range.
   */
  getPropsForKey(key: string): any;
}

/**
 * Creates a new EditorState from a RawDraftContentState, or an empty editor state by
 * passing `null`. Optionally takes a decorator.
 */
export const createEditorStateFromRaw = (
  rawContentState: RawDraftContentState | null,
  decorator?: DraftDecoratorType,
) => {
  let editorState;

  if (rawContentState) {
    const contentState = convertFromRaw(rawContentState);
    editorState = EditorState.createWithContent(contentState, decorator);
  } else {
    editorState = EditorState.createEmpty(decorator);
  }

  return editorState;
};

/**
 * Serialises the editorState using `convertToRaw`, but returns `null` if
 * the editor content is empty (no text, entities, styles).
 */
export const serialiseEditorStateToRaw = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent();
  const rawContentState = convertToRaw(contentState);

  const isEmpty = rawContentState.blocks.every((block) => {
    const isEmptyBlock =
      block.text.trim().length === 0 &&
      (!block.entityRanges || block.entityRanges.length === 0) &&
      (!block.inlineStyleRanges || block.inlineStyleRanges.length === 0);
    return isEmptyBlock;
  });

  return isEmpty ? EMPTY_CONTENT_STATE : rawContentState;
};
