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

  it("toggleEntity - LINK", () => {
    shallow(<DemoEditor extended={false} />)
      .instance()
      .toggleEntity("LINK");

    expect(RichUtils.toggleLink).toHaveBeenCalled();
  });

  it("toggleEntity - IMAGE", () => {
    shallow(<DemoEditor extended={false} />)
      .instance()
      .toggleEntity("IMAGE");

    expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
  });

  it("blockRenderer", () => {
    expect(
      shallow(<DemoEditor extended={false} />)
        .instance()
        .blockRenderer({
          getType: () => "atomic",
        }),
    ).toMatchObject({
      editable: false,
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
