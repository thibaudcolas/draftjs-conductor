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

const copyHandlersRegistry = {};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  const editorContainer = ref.editorContainer.parentNode;
  const key = ref.getEditorKey();

  const onCopy = (e) => {
    // Get clipboard content like Draft.js would.
    // https://github.com/facebook/draft-js/blob/37989027063ccc8279bfdc99a813b857549512a6/src/component/handlers/edit/editOnCopy.js#L34
    const fragment = getFragmentFromSelection(ref._latestEditorState);

    if (fragment) {
      const content = ContentState.createFromBlockArray(fragment.toArray());
      const serialisedContent = JSON.stringify(convertToRaw(content));

      e.target.setAttribute(
        "data-draftjs-conductor-fragment",
        serialisedContent,
      );

      // TODO Is it necessary to clean this up from the DOM?
      // TODO Look at React docs for HTML modifications to React-controlled elements.
      // TODO Find a way to remove the attribute as soon as the browser handled the copy event.
      window.setTimeout(() => {
        e.target.removeAttribute("data-draftjs-conductor-fragment");
      }, 100);
    }
  };

  editorContainer.addEventListener("copy", onCopy);
  copyHandlersRegistry[key] = onCopy;
};

export const unregisterCopySource = (ref: ElementRef<Editor>) => {
  const editorContainer = ref.editorContainer.parentNode;
  const key = ref.getEditorKey();
  const onCopy = copyHandlersRegistry[key];

  editorContainer.removeEventListener("copy", onCopy);
  delete copyHandlersRegistry[key];
};

export const handleDraftEditorPastedText = (
  ref: ElementRef<Editor>,
  text: string,
  html: ?string,
  editorState: EditorState,
) => {
  // Plain-text pastes are better handled by Draft.js.
  if (!html) {
    return false;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const editor = doc.querySelector("[data-editor]");
  const sourceEditorKey = editor ? editor.getAttribute("data-editor") : "";
  const targetEditorKey = ref.getEditorKey();
  const serialisedContent = doc.querySelector(
    "[data-draftjs-conductor-fragment]",
  );

  if (
    sourceEditorKey &&
    sourceEditorKey !== targetEditorKey &&
    serialisedContent
  ) {
    const rawContent = JSON.parse(
      serialisedContent.getAttribute("data-draftjs-conductor-fragment") || "",
    );
    const clipboard = convertFromRaw(rawContent).getBlockMap();

    const content = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      clipboard,
    );
    return EditorState.push(editorState, content, "insert-fragment");
  }

  return false;
};
