import React from "react";
import { shallow } from "enzyme";
import { convertFromRaw } from "draft-js";

import Snippet from "./Snippet";

describe("Snippet", () => {
  it("renders", () => {
    const content = convertFromRaw({
      entityMap: {
        "0": {
          type: "SNIPPET",
          data: {
            text: "This is a snippet",
          },
        },
      },
      blocks: [
        {
          key: "a",
          text: " ",
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
      shallow(
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
    });

    expect(
      shallow(
        <Snippet contentState={content} block={content.getFirstBlock()} />,
      ),
    ).toMatchSnapshot();
  });
});
