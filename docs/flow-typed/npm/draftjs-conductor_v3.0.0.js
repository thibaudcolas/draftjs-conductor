// @flow
/* eslint-disable */
import type { ElementRef } from "react";
import type { ContentState, ContentBlock, EditorState } from "draft-js";
import type { RawDraftContentState } from "draft-js/lib/RawDraftContentState";
import type { DraftDecoratorType } from "draft-js/lib/DraftDecoratorType";
import type { BlockNode } from "draft-js/lib/BlockNode";

declare module "draftjs-conductor" {
  /**
   * Generates CSS styles for list items, for a given selector pattern.
   * @deprecated Use getListNestingStyles instead, which has the same signature.
   * @param {string} selectorPrefix
   * @param {number} minDepth
   * @param {number} maxDepth
   * @param {Array} counterStyles
   */
  declare export function generateListNestingStyles(
    selectorPrefix: string,
    minDepth: number,
    maxDepth: number,
    counterStyles: string[],
  ): string;
  /**
   * Dynamically generates the right list nesting styles.
   * Can be wrapped as a pure component - to re-render only when `max` changes (eg. never).
   */
  declare export function getListNestingStyles(
    maxDepth: number,
    minDepth?: number,
    selectorPrefix?: string,
    counterStyles?: string[],
  ): string;
  /**
   * Add depth classes that Draft.js doesn't provide.
   * See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
   * @param {ContentBlock} block
   */
  declare export function blockDepthStyleFn(block: BlockNode): string;
  declare export function onDraftEditorCopy(
    editor: Editor,
    e: SyntheticClipboardEvent<>,
  ): void;
  declare export function onDraftEditorCut(
    editor: Editor,
    e: SyntheticClipboardEvent<>,
  ): void;
  /**
   * Registers custom copy/cut event listeners on an editor.
   */
  declare export function registerCopySource(ref: ElementRef<Editor>): {
    unregister(): void,
  };
  /**
   * Returns pasted content coming from Draft.js editors set up to serialise
   * their Draft.js content within the HTML.
   */
  declare export function getDraftEditorPastedContent(
    html: string | undefined,
  ): ContentState | null;
  /**
   * Handles pastes coming from Draft.js editors set up to serialise
   * their Draft.js content within the HTML.
   * This SHOULD NOT be used for stripPastedStyles editor.
   */
  declare export function handleDraftEditorPastedText(
    html: string | undefined,
    editorState: EditorState,
  ): false | EditorState;

  /**
   * Creates a new EditorState from a RawDraftContentState, or an empty editor state by
   * passing `null`. Optionally takes a decorator.
   */
  declare export function createEditorStateFromRaw(
    rawContentState: ?RawDraftContentState,
    decorator?: ?DraftDecoratorType,
  ): EditorState;
  /**
   * Serialises the editorState using `convertToRaw`, but returns `null` if
   * the editor content is empty (no text, entities, styles).
   */
  declare export function serialiseEditorStateToRaw(
    editorState: EditorState,
  ): ?RawDraftContentState;
}
