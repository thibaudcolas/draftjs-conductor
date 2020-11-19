// @flow
import type { BlockNode } from "draft-js/lib/BlockNode";

// Default maximum block depth supported by Draft.js CSS.
export const DRAFT_DEFAULT_MAX_DEPTH = 4;

// Default depth class prefix from Draft.js CSS.
export const DRAFT_DEFAULT_DEPTH_CLASS = "public-DraftStyleDefault-depth";

/**
 * Generates CSS styles for list items, for a given selector pattern.
 * @deprecated Use getListNestingStyles instead, which has the same signature.
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
    const d = String(depth);
    const prefix = `${selectorPrefix}${d}`;
    const counter = `ol${d}`;
    const margin = 1.5 * (depth + 1);
    const m = String(margin);

    styles += `
.${prefix}.public-DraftStyleDefault-listLTR { margin-left: ${m}em; }
.${prefix}.public-DraftStyleDefault-listRTL { margin-right: ${m}em; }
.${prefix}.public-DraftStyleDefault-orderedListItem::before { content: counter(${counter}) '. '; counter-increment: ${counter}; }
.${prefix}.public-DraftStyleDefault-reset { counter-reset: ${counter}; }`;
  }

  return styles;
};

/**
 * Dynamically generates the right list nesting styles.
 * Can be wrapped as a pure component - to re-render only when `max` changes (eg. never).
 */
export const getListNestingStyles = (
  maxDepth: number,
  minDepth: number = DRAFT_DEFAULT_MAX_DEPTH + 1,
  selectorPrefix: string = DRAFT_DEFAULT_DEPTH_CLASS,
) => {
  return generateListNestingStyles(selectorPrefix, minDepth, maxDepth);
};

/**
 * Add depth classes that Draft.js doesn't provide.
 * See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
 * @param {ContentBlock} block
 */
export const blockDepthStyleFn = (block: BlockNode) => {
  const depth = block.getDepth();
  return depth > DRAFT_DEFAULT_MAX_DEPTH
    ? `${DRAFT_DEFAULT_DEPTH_CLASS}${String(depth)}`
    : "";
};
