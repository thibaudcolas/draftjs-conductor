// @flow
import { EditorState, Modifier, RichUtils } from "draft-js";

const addLineBreak = (editorState: EditorState) => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  if (selection.isCollapsed()) {
    return RichUtils.insertSoftNewline(editorState);
  }

  let newContent = Modifier.removeRange(content, selection, "forward");
  const fragment = newContent.getSelectionAfter();
  const block = newContent.getBlockForKey(fragment.getStartKey());
  newContent = Modifier.insertText(
    newContent,
    fragment,
    "\n",
    block.getInlineStyleAt(fragment.getStartOffset()),
    null,
  );
  return EditorState.push(editorState, newContent, "insert-fragment");
};

export default {
  addLineBreak,
};
