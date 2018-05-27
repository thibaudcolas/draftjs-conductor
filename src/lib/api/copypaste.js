// @flow
import type { ElementRef } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import getFragmentFromSelection from "draft-js/lib/getFragmentFromSelection";

// Internal attribute added by Draft.js to identify blocks from a given editor.
const EDITOR_ATTR = "data-editor";
// Custom attribute to store Draft.js content in the HTML clipboard.
const FRAGMENT_ATTR = "data-draftjs-conductor-fragment";

const draftEditorCopyListener = (ref: ElementRef<Editor>, e) => {
  // Get clipboard content like Draft.js would.
  // https://github.com/facebook/draft-js/blob/37989027063ccc8279bfdc99a813b857549512a6/src/component/handlers/edit/editOnCopy.js#L34
  const fragment = getFragmentFromSelection(ref._latestEditorState);

  if (fragment) {
    const editorElt = ref.editor;
    const content = ContentState.createFromBlockArray(fragment.toArray());
    const serialisedContent = JSON.stringify(convertToRaw(content));

    const fragmentElts = [].slice.call(
      editorElt.querySelectorAll(`[${FRAGMENT_ATTR}]`),
    );

    // Clean up existing fragment attrs. It's important that the paste content only contains one such attribute.
    fragmentElts.forEach((elt) => elt.removeAttribute(FRAGMENT_ATTR));

    e.target.setAttribute(FRAGMENT_ATTR, serialisedContent);

    // Clean up our attribute from React's DOM after the copy has happened.
    window.setTimeout(() => {
      e.target.removeAttribute(FRAGMENT_ATTR);
    }, 1000);
  }
};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  const editorElt = ref.editor;
  const onCopy = draftEditorCopyListener.bind(null, ref);

  editorElt.addEventListener("copy", onCopy);

  return {
    unregister() {
      editorElt.removeEventListener("copy", onCopy);
    },
  };
};

/**
 * Handles pastes coming from Draft.js editors set up to serialise
 * their Draft.js content within the HTML.
 * This SHOULD NOT be used for stripPastedStyles editor.
 */
export const handleDraftEditorPastedText = (
  ref: ElementRef<Editor>,
  html: ?string,
  editorState: EditorState,
) => {
  // Plain-text pastes are better handled by Draft.js.
  if (!html) {
    return false;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const editor = doc.querySelector(`[${EDITOR_ATTR}]`);
  const sourceEditorKey = editor ? editor.getAttribute(EDITOR_ATTR) : "";
  const targetEditorKey = ref.getEditorKey();
  const fragmentElt = doc.querySelector(`[${FRAGMENT_ATTR}]`);

  // Handle the paste if it comes from Draft.js, but not the current editor, and serialised content is present.
  if (sourceEditorKey && sourceEditorKey !== targetEditorKey && fragmentElt) {
    const fragmentAttr = fragmentElt.getAttribute(FRAGMENT_ATTR) || "";
    let rawContent;

    try {
      // If JSON parsing fails, leave paste handling to Draft.js.
      // There is no reason for this to happen, unless the clipboard was altered somehow.
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
