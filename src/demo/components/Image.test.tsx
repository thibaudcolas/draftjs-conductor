import { describe, it, expect } from "vite-plus/test";
import { render } from "@testing-library/react";

import { convertFromRaw } from "draft-js";

import Image from "./Image";

const renderElement = (element: React.ReactElement) =>
  render(element).container.firstChild;

describe("Image", () => {
  it("renders", () => {
    const content = convertFromRaw({
      entityMap: {
        0: {
          type: "IMAGE",
          mutability: "IMMUTABLE",
          data: {
            src: "/example.png",
          },
        },
      },
      blocks: [
        {
          key: "a",
          text: " ",
          type: "atomic",
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
        <Image contentState={content} block={content.getFirstBlock()} />,
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
          type: "atomic",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
        },
      ],
    });

    expect(
      renderElement(
        <Image contentState={content} block={content.getFirstBlock()} />,
      ),
    ).toMatchSnapshot();
  });
});
