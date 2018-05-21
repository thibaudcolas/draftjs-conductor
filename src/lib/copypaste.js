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
  const isEditor =
    html &&
    html.includes("data-editor") &&
    html.includes("data-draftjs-conductor-fragment");
  const sourceKey = html && isEditor ? /data-editor="(\w+)"/.exec(html)[1] : "";
  const editorKey = ref.getEditorKey();

  console.log("handlePastedText");

  // if (!sourceKey || sourceKey === editorKey || !sourceEditors[sourceKey]) {
  //   return false;
  // }

  // TODO Is this regex safe? Can there be a safer one?
  const fragment =
    html && isEditor
      ? /data-draftjs-conductor-fragment="([^"]+)"/.exec(html)[1]
      : "";
  console.log(fragment);
  const parser = new DOMParser();
  const docFragment = parser.parseFromString(fragment, "text/html");
  const json = docFragment.body.innerHTML;
  console.log(JSON.parse(json));
  const clipboard = convertFromRaw(JSON.parse(json)).getBlockMap();

  // TODO Potentially layer this separately.
  if (clipboard) {
    const newContent = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      clipboard,
    );
    return EditorState.push(editorState, newContent, "insert-fragment");
  }

  return false;
};
