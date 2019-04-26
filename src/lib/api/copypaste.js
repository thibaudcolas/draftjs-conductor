// @flow
import {
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import type { ElementRef } from "react";
import type { Editor, EditorState as EditorStateType } from "draft-js";

const getContentStateFragment = require("draft-js/lib/getContentStateFragment");
const getDraftEditorSelection = require("draft-js/lib/getDraftEditorSelection");

// Custom attribute to store Draft.js content in the HTML clipboard.
const FRAGMENT_ATTR = "data-draftjs-conductor-fragment";

/**
 * Overrides the default copy/cut behavior, adding the serialised Draft.js content to the clipboard data.
 * See also https://github.com/basecamp/trix/blob/62145978f352b8d971cf009882ba06ca91a16292/src/trix/controllers/input_controller.coffee#L415-L422
 * We serialise the editor content within HTML, not as a separate mime type, because Draft.js only allows access
 * to HTML in its paste event handler.
 */
const draftEditorCopyListener = (
  ref: ElementRef<Editor>,
  e: Event & {
    clipboardData: DataTransfer,
  },
) => {
  // Completely skip event handling if clipboardData is not supported (IE11 is out).
  if (!e.clipboardData) {
    return;
  }

  const selection = window.getSelection();
  // Get clipboard content from the selection like Draft.js would.
  const editorState = ref._latestEditorState;
  const editorRoot = ref.editor;
  const { selectionState } = getDraftEditorSelection(editorState, editorRoot);

  const fragment = getContentStateFragment(
    editorState.getCurrentContent(),
    selectionState,
  );

  // Override the default behavior if there is a selection, and content.
  if (selection.rangeCount > 0 && fragment) {
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
 * Handles pastes coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 * This SHOULD NOT be used for stripPastedStyles editor.
 */
export const handleDraftEditorPastedText = (
  html: ?string,
  editorState: EditorStateType,
) => {
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

    const fragment = convertFromRaw(rawContent).getBlockMap();

    const content = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      fragment,
    );
    return EditorState.push(editorState, content, "insert-fragment");
  }

  return false;
};
