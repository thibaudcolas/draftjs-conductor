import React from "react";
import { shallow } from "enzyme";
import { EditorState, RichUtils, AtomicBlockUtils } from "draft-js";

import DemoEditor from "./DemoEditor";

describe("DemoEditor", () => {
  beforeEach(() => {
    global.sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    jest.spyOn(RichUtils, "toggleInlineStyle");
    jest.spyOn(RichUtils, "toggleBlockType");
    jest.spyOn(RichUtils, "toggleLink");
    jest.spyOn(AtomicBlockUtils, "insertAtomicBlock");
  });

  afterEach(() => {
    RichUtils.toggleInlineStyle.mockRestore();
    RichUtils.toggleBlockType.mockRestore();
    RichUtils.toggleLink.mockRestore();
    AtomicBlockUtils.insertAtomicBlock.mockRestore();
  });

  it("renders", () => {
    // Do not snapshot the Draft.js editor, as it contains unstable keys in the content.
    expect(
      shallow(<DemoEditor extended={false} />).find(".EditorToolbar"),
    ).toMatchSnapshot();
  });

  describe("#extended", () => {
    it("works", () => {
      expect(
        shallow(<DemoEditor extended />).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });

    it("save feature", () => {
      global.sessionStorage.getItem.mockReturnValue(
        JSON.stringify({
          entityMap: {},
          blocks: [
            {
              key: "a",
              text: "test",
            },
          ],
        }),
      );

      expect(
        shallow(<DemoEditor extended />)
          .state("editorState")
          .getCurrentContent()
          .getBlockMap()
          .map((b) => b.getText())
          .toJS(),
      ).toEqual({
        a: "test",
      });
    });
  });

  describe("onChange", () => {
    it("works", () => {
      const state = EditorState.createEmpty();
      const wrapper = shallow(<DemoEditor extended={false} />);

      wrapper.instance().onChange(state);

      expect(wrapper.state("editorState")).toBe(state);
    });
  });

  it("toggleStyle", () => {
    shallow(<DemoEditor extended={false} />)
      .instance()
      .toggleStyle("BOLD", new Event("mousedown"));

    expect(RichUtils.toggleInlineStyle).toHaveBeenCalled();
  });

  it("toggleBlock", () => {
    shallow(<DemoEditor extended={false} />)
      .instance()
      .toggleBlock("header-two", new Event("mousedown"));

    expect(RichUtils.toggleBlockType).toHaveBeenCalled();
  });

  describe("toggleEntity", () => {
    it("LINK", () => {
      shallow(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("LINK");

      expect(RichUtils.toggleLink).toHaveBeenCalled();
    });

    it("IMAGE", () => {
      shallow(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("IMAGE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("HORIZONTAL_RULE", () => {
      shallow(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("HORIZONTAL_RULE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });
  });

  describe("blockRenderer", () => {
    it("unstyled", () => {
      expect(
        shallow(<DemoEditor extended={false} />)
          .instance()
          .blockRenderer({
            getType: () => "unstyled",
          }),
      ).toBe(null);
    });

    it("HORIZONTAL_RULE", () => {
      window.sessionStorage.getItem = jest.fn(() =>
        JSON.stringify({
          entityMap: {
            "3": {
              type: "HORIZONTAL_RULE",
              data: {},
            },
          },
          blocks: [
            {
              type: "atomic",
              text: " ",
              entityRanges: [
                {
                  key: 3,
                  offset: 0,
                  length: 1,
                },
              ],
            },
          ],
        }),
      );
      const Component = shallow(<DemoEditor extended={true} />)
        .instance()
        .blockRenderer({
          getType: () => "atomic",
          getEntityAt: () => "3",
        }).component;
      expect(Component()).toEqual(<hr />);
    });

    it("IMAGE", () => {
      window.sessionStorage.getItem = jest.fn(() =>
        JSON.stringify({
          entityMap: {
            "1": {
              type: "IMAGE",
              data: {
                src: "example.png",
              },
            },
          },
          blocks: [
            {
              type: "atomic",
              text: " ",
              entityRanges: [
                {
                  key: 1,
                  offset: 0,
                  length: 1,
                },
              ],
            },
          ],
        }),
      );

      const Component = shallow(<DemoEditor extended={true} />)
        .instance()
        .blockRenderer({
          getType: () => "atomic",
          getEntityAt: () => "1",
        }).component;
      expect(<Component />).toMatchSnapshot();
    });
  });

  describe("onTab", () => {
    it("works", () => {
      const wrapper = shallow(<DemoEditor extended={false} />);

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().onTab({});
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("#extended", () => {
      const wrapper = shallow(<DemoEditor extended />);

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().onTab({});
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });
});
