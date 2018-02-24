import React from "react";
import { shallow } from "enzyme";
import prettier from "prettier";
import { ContentBlock } from "draft-js";

import ListNestingStyles, {
  DRAFT_DEFAULT_MAX_DEPTH,
  DRAFT_DEFAULT_DEPTH_CLASS,
  generateListNestingStyles,
  blockDepthStyleFn,
} from "../components/ListNestingStyles";

describe("generateListNestingStyles", () => {
  it("works", () => {
    const styles = prettier.format(generateListNestingStyles("TEST", 0, 2), {
      parser: "css",
    });
    expect(styles).toMatchSnapshot();
  });

  it("strips whitespace", () => {
    expect(generateListNestingStyles("TEST", 0, 2)).not.toContain("\n");
  });
});

describe("ListNestingStyles", () => {
  it("works", () => {
    expect(shallow(<ListNestingStyles max={0} />)).toMatchSnapshot();
  });

  it("max > DRAFT_DEFAULT_MAX_DEPTH", () => {
    expect(
      shallow(<ListNestingStyles max={DRAFT_DEFAULT_MAX_DEPTH + 1} />),
    ).toMatchSnapshot();
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
