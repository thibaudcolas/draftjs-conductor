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
    const content = ContentState.createFromBlockArray(fragment.toArray());
    const serialisedContent = JSON.stringify(convertToRaw(content));

    e.target.setAttribute(FRAGMENT_ATTR, serialisedContent);

    // TODO Is it necessary to clean this up from the DOM?
    // TODO Look at React docs for HTML modifications to React-controlled elements.
    // TODO Find a way to remove the attribute as soon as the browser handled the copy event.
    window.setTimeout(() => {
      e.target.removeAttribute(FRAGMENT_ATTR);
    }, 100);
  }
};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  // TODO CHeck on what element best to add the event handler.
  const editorContainer = ref.editorContainer.parentNode;
  const onCopy = draftEditorCopyListener.bind(null, ref);

  editorContainer.addEventListener("copy", onCopy);

  return {
    unregister() {
      editorContainer.removeEventListener("copy", onCopy);
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
  const raw = doc.querySelector(`[${FRAGMENT_ATTR}]`);

  // Handle the paste if it comes from Draft.js, but not the current editor, and serialised content is present.
  if (sourceEditorKey && sourceEditorKey !== targetEditorKey && raw) {
    const rawContent = JSON.parse(raw.getAttribute(FRAGMENT_ATTR) || "");
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
