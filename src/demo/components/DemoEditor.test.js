import React from "react";
import { mount } from "enzyme";
import { EditorState, RichUtils, AtomicBlockUtils } from "draft-js";

import DemoEditor from "./DemoEditor";
import DraftUtils from "../utils/DraftUtils";

describe("DemoEditor", () => {
  beforeEach(() => {
    jest.spyOn(RichUtils, "toggleInlineStyle");
    jest.spyOn(RichUtils, "toggleBlockType");
    jest.spyOn(RichUtils, "toggleLink");
    jest.spyOn(AtomicBlockUtils, "insertAtomicBlock");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders", () => {
    // Do not snapshot the Draft.js editor, as it contains unstable keys in the content.
    expect(
      mount(<DemoEditor extended={false} />).find(".EditorToolbar"),
    ).toMatchSnapshot();
  });

  it("componentWillUnmount", () => {
    const wrapper = mount(<DemoEditor extended={false} />);
    const copySource = wrapper.instance().copySource;
    jest.spyOn(copySource, "unregister");
    expect(copySource).not.toBeNull();
    wrapper.unmount();
    expect(copySource.unregister).toHaveBeenCalled();
  });

  describe("#extended", () => {
    it("works", () => {
      expect(
        mount(<DemoEditor extended />).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });

    it("can take predefined content", () => {
      expect(
        mount(
          <DemoEditor
            rawContentState={{
              blocks: [{ key: "a", text: "Test" }],
              entityMap: {},
            }}
          />,
        ).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });
  });

  describe("onChange", () => {
    it("works", () => {
      const state = EditorState.createEmpty();
      const wrapper = mount(<DemoEditor extended={false} />);

      wrapper.instance().onChange(state);

      expect(wrapper.state("editorState")).toBe(state);
    });
  });

  it("toggleStyle", () => {
    mount(<DemoEditor extended={false} />)
      .instance()
      .toggleStyle("BOLD", new Event("mousedown"));

    expect(RichUtils.toggleInlineStyle).toHaveBeenCalled();
  });

  it("toggleBlock", () => {
    mount(<DemoEditor extended={false} />)
      .instance()
      .toggleBlock("header-two", new Event("mousedown"));

    expect(RichUtils.toggleBlockType).toHaveBeenCalled();
  });

  describe("toggleEntity", () => {
    it("LINK", () => {
      mount(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("LINK");

      expect(RichUtils.toggleLink).toHaveBeenCalled();
    });

    it("IMAGE", () => {
      mount(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("IMAGE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("SNIPPET", () => {
      mount(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("SNIPPET");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("HORIZONTAL_RULE", () => {
      mount(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("HORIZONTAL_RULE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });
  });

  describe("blockRenderer", () => {
    it("unstyled", () => {
      expect(
        mount(<DemoEditor extended={false} />)
          .instance()
          .blockRenderer({
            getType: () => "unstyled",
          }),
      ).toBe(null);
    });

    it("no entity", () => {
      window.sessionStorage.getItem = jest.fn(() =>
        JSON.stringify({
          entityMap: {},
          blocks: [
            {
              type: "atomic",
              text: " ",
              entityRanges: [],
            },
          ],
        }),
      );
      const editable = mount(<DemoEditor extended={true} />)
        .instance()
        .blockRenderer({
          getType: () => "atomic",
          getEntityAt: () => null,
        }).editable;
      expect(editable).toBe(false);
    });

    it("HORIZONTAL_RULE", () => {
      const rawContentState = {
        entityMap: {
          5: {
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
                key: 5,
                offset: 0,
                length: 1,
              },
            ],
          },
        ],
      };
      const instance = mount(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      ).component;
      expect(Component()).toEqual(<hr />);
    });

    it("IMAGE", () => {
      const rawContentState = {
        entityMap: {
          1: {
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
      };

      const instance = mount(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      ).component;
      expect(<Component />).toMatchInlineSnapshot(`<Image />`);
    });

    it("SNIPPET", () => {
      const rawContentState = {
        entityMap: {
          0: {
            type: "SNIPPET",
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
                key: 0,
                offset: 0,
                length: 1,
              },
            ],
          },
        ],
      };

      const instance = mount(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      ).component;
      expect(<Component />).toMatchInlineSnapshot(`<Snippet />`);
    });
  });

  describe("handlePastedText", () => {
    it("handled by handleDraftEditorPastedText", () => {
      const wrapper = mount(<DemoEditor extended={false} />);
      const content = {
        blocks: [
          {
            data: {},
            depth: 0,
            entityRanges: [],
            inlineStyleRanges: [],
            key: "a",
            text: "hello,\nworld!",
            type: "unstyled",
          },
        ],
        entityMap: {},
      };
      const html = `<div data-draftjs-conductor-fragment='${JSON.stringify(
        content,
      )}'><p>Hello, world!</p></div>`;

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "hello,\nworld!",
            html,
            wrapper.state("editorState"),
          ),
      ).toBe(true);
    });

    it("default handling", () => {
      const wrapper = mount(<DemoEditor extended={false} />);

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "this is plain text paste",
            "this is plain text paste",
            wrapper.state("editorState"),
          ),
      ).toBe(false);
    });
  });

  describe("keyBindingFn", () => {
    it("works", () => {
      const wrapper = mount(<DemoEditor extended={false} />);

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().keyBindingFn({ keyCode: 9 });
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("does not change state directly with other keys", () => {
      const wrapper = mount(<DemoEditor extended={false} />);

      wrapper.instance().onChange = jest.fn();
      wrapper.instance().keyBindingFn({ keyCode: 22 });
      expect(wrapper.instance().onChange).not.toHaveBeenCalled();
    });
  });

  describe("addBR", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<DemoEditor extended={false} />);

      jest.spyOn(DraftUtils, "addLineBreak");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      DraftUtils.addLineBreak.mockRestore();
    });

    it("works", () => {
      wrapper.instance().addBR({
        preventDefault() {},
      });

      expect(DraftUtils.addLineBreak).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("toggleReadOnly", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<DemoEditor extended={false} />);
    });

    it("works", () => {
      expect(wrapper.instance().state.readOnly).toBe(false);
      expect(wrapper.find(".EditorToolbar button:last-child").text()).toBe(
        "📖",
      );
      wrapper.instance().toggleReadOnly({
        preventDefault() {},
      });
      expect(wrapper.instance().state.readOnly).toBe(true);
      expect(wrapper.find(".EditorToolbar button:last-child").text()).toBe(
        "📕",
      );
    });
  });
});
