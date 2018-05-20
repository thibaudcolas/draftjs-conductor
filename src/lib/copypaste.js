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

const sourceEditors = {};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  // TODO Do we want to keep this registry?
  sourceEditors[ref.getEditorKey()] = ref;

  const editorContainer = ref.editorContainer.parentNode;
  editorContainer.addEventListener("copy", (e) => {
    // TODO Use internal clipboard directly instead of this?
    const fragment = getFragmentFromSelection(ref._latestEditorState);

    if (fragment) {
      const content = ContentState.createFromBlockArray(fragment.toArray());
      // TODO Should clean this up from the DOM after the copy has been handled.
      e.target.setAttribute(
        "data-draftjs-conductor-fragment",
        JSON.stringify(convertToRaw(content)),
      );
    }
  });

  document.addEventListener("paste", (e) => {
    console.log(e.clipboardData.getData("text/plain"));
    console.log(e.clipboardData.getData("text/html"));
  });
};

export const unregisterCopySource = (ref: ElementRef<Editor>) => {
  delete sourceEditors[ref.getEditorKey()];
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
