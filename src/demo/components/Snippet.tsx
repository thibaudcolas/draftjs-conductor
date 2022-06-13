import React from "react";
import { ContentBlock, ContentState } from "draft-js";

import "./Snippet.css";

const Snippet = ({
  block,
  contentState
}: {
  block: ContentBlock,
  contentState: ContentState
}) => {
  const entityKey = block.getEntityAt(0);
  const text = entityKey
    ? contentState.getEntity(entityKey).getData().text
    : "Placeholder";
  return (
    <div className="Snippet" contentEditable={false}>
      This is a snippet block:
      <div className="Snippet__text" contentEditable={false}>
        {text}
      </div>
    </div>
  );
};

export default Snippet;
