// @flow
import getContentStateFragment from "draft-js/lib/getContentStateFragment";
import getDraftEditorSelection from "draft-js/lib/getDraftEditorSelection";
import {
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";

import type { ElementRef } from "react";
import type { Editor, EditorState as EditorStateType } from "draft-js";

// Custom attribute to store Draft.js content in the HTML clipboard.
const FRAGMENT_ATTR = "data-draftjs-conductor-fragment";

const DRAFT_DECORATOR = '[data-contents="true"] [contenteditable="false"]';

// Checks whether the selection is inside a decorator or not.
// This is important to change the copy-cut behavior accordingly.
const isSelectionInDecorator = (selection: Selection) => {
  const { anchorNode, focusNode } = selection;
  if (!anchorNode || !focusNode) {
    return false;
  }

  const anchor =
    anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
  const focus =
    focusNode instanceof Element ? focusNode : focusNode.parentElement;

  const anchorDecorator = anchor && anchor.closest(DRAFT_DECORATOR);
  const focusDecorator = focus && focus.closest(DRAFT_DECORATOR);

  return (
    anchorDecorator &&
    focusDecorator &&
    (anchorDecorator.contains(focusDecorator) ||
      focusDecorator.contains(anchorDecorator))
  );
};

// Get clipboard content from the selection like Draft.js would.
const getSelectedContent = (
  editorState: EditorStateType,
  editorRoot: HTMLElement,
) => {
  const { selectionState } = getDraftEditorSelection(editorState, editorRoot);

  const fragment = getContentStateFragment(
    editorState.getCurrentContent(),
    selectionState,
  );

  // If the selection contains no content (according to Draft.js), use the default browser behavior.
  // This happens when selecting text that's within contenteditable=false blocks in Draft.js.
  // See https://github.com/thibaudcolas/draftjs-conductor/issues/12.
  const isEmpty = fragment.every((block) => {
    return block.getText().length === 0;
  });

  return isEmpty ? null : fragment;
};

// Overrides the default copy/cut behavior, adding the serialised Draft.js content to the clipboard data.
// See also https://github.com/basecamp/trix/blob/62145978f352b8d971cf009882ba06ca91a16292/src/trix/controllers/input_controller.coffee#L415-L422
// We serialise the editor content within HTML, not as a separate mime type, because Draft.js only allows access
// to HTML in its paste event handler.
const draftEditorCopyListener = (
  ref: ElementRef<Editor>,
  e: Event & {
    clipboardData: DataTransfer,
  },
) => {
  const selection = window.getSelection();

  // Completely skip event handling if clipboardData is not supported (IE11 is out).
  // Also skip if there is no selection ranges.
  // Or if the selection is fully within a decorator.
  if (
    !e.clipboardData ||
    selection.rangeCount === 0 ||
    isSelectionInDecorator(selection)
  ) {
    return;
  }

  const fragment = getSelectedContent(ref._latestEditorState, ref.editor);

  // Override the default behavior if there is selected content.
  if (fragment) {
    const content = ContentState.createFromBlockArray(fragment.toArray());
    const serialisedContent = JSON.stringify(convertToRaw(content));

    // Create a temporary element to store the selection’s HTML.
    // See also Rangy's implementation: https://github.com/timdown/rangy/blob/1e55169d2e4d1d9458c2a87119addf47a8265276/src/core/domrange.js#L515-L520.
    const fragmentElt = document.createElement("div");
    // Modern browsers only support a single range.
    fragmentElt.appendChild(selection.getRangeAt(0).cloneContents());
    fragmentElt.setAttribute(FRAGMENT_ATTR, serialisedContent);
    // We set the style property to replicate the browser's behavior of inline styles in rich text copy-paste.
    // In Draft.js, this is important for line breaks to be interpreted correctly when pasted into another word processor.
    // See https://github.com/facebook/draft-js/blob/a1f4593d8fa949954053e5d5840d33ce1d1082c6/src/component/base/DraftEditor.react.js#L328.
    fragmentElt.setAttribute("style", "white-space: pre-wrap;");

    e.clipboardData.setData("text/plain", selection.toString());
    e.clipboardData.setData("text/html", fragmentElt.outerHTML);

    e.preventDefault();
  }
};

/**
 * Registers custom copy/cut event listeners on an editor.
 */
export const registerCopySource = (ref: ElementRef<Editor>) => {
  const editorElt = ref.editor;
  const onCopy = draftEditorCopyListener.bind(null, ref);

  editorElt.addEventListener("copy", onCopy);
  editorElt.addEventListener("cut", onCopy);

  return {
    unregister() {
      editorElt.removeEventListener("copy", onCopy);
      editorElt.removeEventListener("cut", onCopy);
    },
  };
};

/**
 * Returns pasted content coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 */
export const getDraftEditorPastedContent = (html: ?string) => {
  // Plain-text pastes are better handled by Draft.js.
  if (html === "" || typeof html === "undefined" || html === null) {
    return false;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragmentElt = doc.querySelector(`[${FRAGMENT_ATTR}]`);

  // Handle the paste if it comes from draftjs-conductor.
  if (fragmentElt) {
    const fragmentAttr = fragmentElt.getAttribute(FRAGMENT_ATTR);
    let rawContent;

    try {
      // If JSON parsing fails, leave paste handling to Draft.js.
      // There is no reason for this to happen, unless the clipboard was altered somehow.
      // $FlowFixMe
      rawContent = JSON.parse(fragmentAttr);
    } catch (error) {
      return false;
    }

    return convertFromRaw(rawContent);
  }

  return false;
};

/**
 * Handles pastes coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 * This SHOULD NOT be used for stripPastedStyles editor.
 */
export const handleDraftEditorPastedText = (
  html: ?string,
  editorState: EditorStateType,
) => {
  const pastedContent = getDraftEditorPastedContent(html);

  if (pastedContent) {
    const fragment = pastedContent.getBlockMap();

    const content = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      fragment,
    );
    return EditorState.push(editorState, content, "insert-fragment");
  }

  return false;
};
