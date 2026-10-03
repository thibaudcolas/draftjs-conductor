import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";

import { convertFromRaw, RawDraftContentState } from "draft-js";

import Snippet from "./Snippet";

const renderElement = (element: React.ReactElement) =>
  render(element).container.firstChild;

describe("Snippet", () => {
  it("renders", () => {
    const content = convertFromRaw({
      entityMap: {
        0: {
          type: "SNIPPET",
          mutability: "IMMUTABLE",
          data: {
            text: "This is a snippet",
          },
        },
      },
      blocks: [
        {
          key: "a",
          text: " ",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 0,
              length: 1,
              key: 0,
            },
          ],
        },
      ],
    });

    expect(
      renderElement(
        <Snippet contentState={content} block={content.getFirstBlock()} />,
      ),
    ).toMatchSnapshot();
  });

  it("no entity", () => {
    const content = convertFromRaw({
      entityMap: {},
      blocks: [
        {
          key: "a",
          text: " ",
        },
      ],
    } as RawDraftContentState);

    expect(
      renderElement(
        <Snippet contentState={content} block={content.getFirstBlock()} />,
      ),
    ).toMatchSnapshot();
  });
});
