// @flow
import type { ElementRef } from "react";
import { Editor, EditorState, Modifier } from "draft-js";

const sourceEditors = {};

export const registerCopySource = (ref: ElementRef<Editor>) => {
  sourceEditors[ref.getEditorKey()] = ref;
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
  const isEditor = html && html.includes("data-editor");
  const sourceKey = html && isEditor ? /data-editor="(\w+)"/.exec(html)[1] : "";
  const editorKey = ref.getEditorKey();

  if (!sourceKey || sourceKey === editorKey || !sourceEditors[sourceKey]) {
    return false;
  }

  const clipboard = sourceEditors[sourceKey].getClipboard();

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
