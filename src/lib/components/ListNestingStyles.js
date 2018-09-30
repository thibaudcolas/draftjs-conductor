// @flow
import React, { PureComponent } from "react";

import type { BlockNode } from "draft-js/lib/BlockNode.js.flow";

// Default maximum block depth supported by Draft.js CSS.
export const DRAFT_DEFAULT_MAX_DEPTH = 4;

// Default depth class prefix from Draft.js CSS.
export const DRAFT_DEFAULT_DEPTH_CLASS = "public-DraftStyleDefault-depth";

/**
 * Generates CSS styles for list items, for a given selector pattern.
 * @param {string} selectorPrefix
 * @param {number} minDepth
 * @param {number} maxDepth
 */
export const generateListNestingStyles = (
  selectorPrefix: string,
  minDepth: number,
  maxDepth: number,
) => {
  let styles = "";

  for (let depth = minDepth; depth <= maxDepth; depth++) {
    const prefix = `${selectorPrefix}${depth}`;
    const counter = `ol${depth}`;
    const margin = 1.5 * (depth + 1);

    styles += `
.${prefix}.public-DraftStyleDefault-listLTR { margin-left: ${margin}em; }
.${prefix}.public-DraftStyleDefault-listRTL { margin-right: ${margin}em; }
.${prefix}.public-DraftStyleDefault-orderedListItem::before { content: counter(${counter}) '. '; counter-increment: ${counter}; }
.${prefix}.public-DraftStyleDefault-reset { counter-reset: ${counter}; }`;
  }

  return styles;
};

/**
 * Dynamically generates the right list nesting styles.
 * Pure component - will only re-render when `max` changes (eg. never).
 * @param {number} max
 */
class ListNestingStyles extends PureComponent<{
  prefix: string,
  max: number,
}> {
  static defaultProps: {
    prefix: string,
  };

  render() {
    const { prefix, max } = this.props;
    const min = DRAFT_DEFAULT_MAX_DEPTH + 1;

    return max > DRAFT_DEFAULT_MAX_DEPTH ? (
      <style>{generateListNestingStyles(prefix, min, max)}</style>
    ) : null;
  }
}

ListNestingStyles.defaultProps = {
  prefix: DRAFT_DEFAULT_DEPTH_CLASS,
};

/**
 * Add depth classes that Draft.js doesn't provide.
 * See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
 * @param {ContentBlock} block
 */
export const blockDepthStyleFn = (block: BlockNode) => {
  const depth = block.getDepth();
  return depth > DRAFT_DEFAULT_MAX_DEPTH
    ? `${DRAFT_DEFAULT_DEPTH_CLASS}${depth}`
    : "";
};

export default ListNestingStyles;
