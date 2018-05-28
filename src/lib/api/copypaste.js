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

/**
 * This function is a hack. Ideally, we should:
 * 1. Intercept the copy event here,
 * 2. Then use `event.clipboardData` to set the copy content as plain text, HTML, and Draft.js ContentState on the clipboard.
 * Like Trix does: https://github.com/basecamp/trix/blob/62145978f352b8d971cf009882ba06ca91a16292/src/trix/controllers/input_controller.coffee#L415-L422.
 * 3. Then `preventDefault()` so the browser doesn’t interfere.
 *
 * Unfortunately Draft.js doesn't have built-in support for HTML serialisation.
 * Instead, we:
 * 1. Intercept the copy event here,
 * 2. Then set the copy content's Draft.js ContentState as a data- attribute in a random contenteditable element that's selected.
 * 3. Then the browser's default copy handling serialises that attribute within the HTML content on the clipboard.
 *
 * This seems quite brittle, but it works.
 */
const draftEditorCopyListener = (ref: ElementRef<Editor>, e: Object) => {
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
  }
};

// Cleans up our attribute from the Draft.js / React DOM after the copy has happened.
const documentCopyListener = (e: Object) => {
  // This schedules the attribute cleanup to happen in the next iteration of the JS event loop.
  // This is the best way I found to run code "after the browser has handled the copy event", but it probably is implementation-dependent.
  // I'm not sure whether it is really  necessary to set this timeout within an event listener on the document object rather than closer to the event target.
  window.setTimeout(() => {
    if (e.target && e.target.hasAttribute(FRAGMENT_ATTR)) {
      e.target.removeAttribute(FRAGMENT_ATTR);
    }
  }, 0);
};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  const editorElt = ref.editor;
  const onCopy = draftEditorCopyListener.bind(null, ref);

  editorElt.addEventListener("copy", onCopy);
  document.addEventListener("copy", documentCopyListener);

  return {
    unregister() {
      editorElt.removeEventListener("copy", onCopy);
      document.removeEventListener("copy", documentCopyListener);
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
