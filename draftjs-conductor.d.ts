import { ContentBlock, ContentState, DraftDecoratorType, Editor, EditorState, RawDraftContentState } from "draft-js";
import React from "react";
//#region src/lib/api/lists.d.ts
export declare const DRAFT_DEFAULT_MAX_DEPTH = 4;
export declare const DRAFT_DEFAULT_DEPTH_CLASS = "public-DraftStyleDefault-depth";
/**
 * Generates CSS styles for list items, for a given selector pattern.
 * @deprecated Use getListNestingStyles instead, which has the same signature.
 * @param {string} selectorPrefix
 * @param {number} minDepth
 * @param {number} maxDepth
 * @param {Array} counterStyles
 */
export declare const generateListNestingStyles: (selectorPrefix: string, minDepth: number, maxDepth: number, counterStyles: string[]) => string;
/**
 * Dynamically generates the right list nesting styles.
 * Can be wrapped as a pure component - to re-render only when `max` changes (eg. never).
 */
export declare const getListNestingStyles: (maxDepth: number, minDepth?: number, selectorPrefix?: string, counterStyles?: string[]) => string;
/**
 * Add depth classes that Draft.js doesn't provide.
 * See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
 * @param {ContentBlock} block
 */
export declare const blockDepthStyleFn: (block: ContentBlock) => string;
//#endregion
//#region src/lib/api/copypaste.d.ts
export declare const onDraftEditorCopy: (editor: Editor, e: React.ClipboardEvent<HTMLElement>) => void;
export declare const onDraftEditorCut: (editor: Editor, e: React.ClipboardEvent<HTMLElement>) => void;
/**
 * Registers custom copy/cut event listeners on an editor.
 */
export declare const registerCopySource: (ref: Editor) => {
  unregister(): void;
};
/**
 * Returns pasted content coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 */
export declare const getDraftEditorPastedContent: (html: string | undefined) => ContentState | null;
/**
 * Handles pastes coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 * This SHOULD NOT be used for stripPastedStyles editor.
 */
export declare const handleDraftEditorPastedText: (html: string | undefined, editorState: EditorState) => false | EditorState;
//#endregion
//#region src/lib/api/conversion.d.ts
/**
 * Creates a new EditorState from a RawDraftContentState, or an empty editor state by
 * passing `null`. Optionally takes a decorator.
 */
export declare const createEditorStateFromRaw: (rawContentState: RawDraftContentState | null, decorator?: DraftDecoratorType) => EditorState;
/**
 * Serialises the editorState using `convertToRaw`, but returns `null` if
 * the editor content is empty (no text, entities, styles).
 */
export declare const serialiseEditorStateToRaw: (editorState: EditorState) => RawDraftContentState | null;
//#endregion