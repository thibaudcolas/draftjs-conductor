import prettier from "prettier";
import { ContentBlock } from "draft-js";

import {
  getListNestingStyles,
  DRAFT_DEFAULT_MAX_DEPTH,
  DRAFT_DEFAULT_DEPTH_CLASS,
  generateListNestingStyles,
  blockDepthStyleFn,
} from "./lists";

describe("generateListNestingStyles", () => {
  it("works", () => {
    const styles = prettier.format(generateListNestingStyles("TEST", 0, 2), {
      parser: "css",
    });
    expect(styles).toMatchInlineSnapshot(`
      ".TEST0.public-DraftStyleDefault-listLTR {
        margin-left: 1.5em;
      }
      .TEST0.public-DraftStyleDefault-listRTL {
        margin-right: 1.5em;
      }
      .TEST0.public-DraftStyleDefault-orderedListItem::before {
        content: counter(ol0) \\". \\";
        counter-increment: ol0;
      }
      .TEST0.public-DraftStyleDefault-reset {
        counter-reset: ol0;
      }
      .TEST1.public-DraftStyleDefault-listLTR {
        margin-left: 3em;
      }
      .TEST1.public-DraftStyleDefault-listRTL {
        margin-right: 3em;
      }
      .TEST1.public-DraftStyleDefault-orderedListItem::before {
        content: counter(ol1) \\". \\";
        counter-increment: ol1;
      }
      .TEST1.public-DraftStyleDefault-reset {
        counter-reset: ol1;
      }
      .TEST2.public-DraftStyleDefault-listLTR {
        margin-left: 4.5em;
      }
      .TEST2.public-DraftStyleDefault-listRTL {
        margin-right: 4.5em;
      }
      .TEST2.public-DraftStyleDefault-orderedListItem::before {
        content: counter(ol2) \\". \\";
        counter-increment: ol2;
      }
      .TEST2.public-DraftStyleDefault-reset {
        counter-reset: ol2;
      }
      "
    `);
  });
});

describe("getListNestingStyles", () => {
  it("works", () => {
    expect(getListNestingStyles(0)).toMatchInlineSnapshot(`""`);
  });

  it("max > DRAFT_DEFAULT_MAX_DEPTH", () => {
    expect(getListNestingStyles(DRAFT_DEFAULT_MAX_DEPTH + 1))
      .toMatchInlineSnapshot(`
      "
      .public-DraftStyleDefault-depth5.public-DraftStyleDefault-listLTR { margin-left: 9em; }
      .public-DraftStyleDefault-depth5.public-DraftStyleDefault-listRTL { margin-right: 9em; }
      .public-DraftStyleDefault-depth5.public-DraftStyleDefault-orderedListItem::before { content: counter(ol5) '. '; counter-increment: ol5; }
      .public-DraftStyleDefault-depth5.public-DraftStyleDefault-reset { counter-reset: ol5; }"
      `);
  });
});

describe("blockDepthStyleFn", () => {
  it("works", () => {
    expect(
      blockDepthStyleFn(
        new ContentBlock({
          depth: 0,
        }),
      ),
    ).toEqual("");
  });

  it("depth > DRAFT_DEFAULT_MAX_DEPTH", () => {
    expect(
      blockDepthStyleFn(
        new ContentBlock({
          depth: DRAFT_DEFAULT_MAX_DEPTH + 1,
        }),
      ),
    ).toEqual(`${DRAFT_DEFAULT_DEPTH_CLASS}${DRAFT_DEFAULT_MAX_DEPTH + 1}`);
  });
});
