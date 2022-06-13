import React from "react";
import { mount, ReactWrapper } from "enzyme";
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  RawDraftContentState,
  ContentBlock,
  RawDraftContentBlock,
} from "draft-js";

import DemoEditor, { DemoEditorProps, DemoEditorState } from "./DemoEditor";
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
      mount<DemoEditor>(<DemoEditor extended={false} />).find(".EditorToolbar"),
    ).toMatchSnapshot();
  });

  describe("#extended", () => {
    it("works", () => {
      expect(
        mount<DemoEditor>(<DemoEditor extended />).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });

    it("can take predefined content", () => {
      expect(
        mount<DemoEditor>(
          <DemoEditor
            rawContentState={
              {
                blocks: [{ key: "a", text: "Test" }],
                entityMap: {},
              } as RawDraftContentState
            }
          />,
        ).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });
  });

  describe("onChange", () => {
    it("works", () => {
      const state = EditorState.createEmpty();
      const wrapper = mount<DemoEditor>(<DemoEditor extended={false} />);

      wrapper.instance().onChange(state);

      expect(wrapper.state("editorState")).toBe(state);
    });
  });

  it("toggleStyle", () => {
    mount<DemoEditor>(<DemoEditor extended={false} />)
      .instance()
      // @ts-expect-error
      .toggleStyle("BOLD", new MouseEvent<HTMLButtonElement>("mousedown"));

    expect(RichUtils.toggleInlineStyle).toHaveBeenCalled();
  });

  it("toggleBlock", () => {
    mount<DemoEditor>(<DemoEditor extended={false} />)
      .instance()
      // @ts-expect-error
      .toggleBlock(
        "header-two",
        new MouseEvent<HTMLButtonElement>("mousedown"),
      );

    expect(RichUtils.toggleBlockType).toHaveBeenCalled();
  });

  describe("toggleEntity", () => {
    it("LINK", () => {
      mount<DemoEditor>(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("LINK");

      expect(RichUtils.toggleLink).toHaveBeenCalled();
    });

    it("IMAGE", () => {
      mount<DemoEditor>(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("IMAGE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("SNIPPET", () => {
      mount<DemoEditor>(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("SNIPPET");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("HORIZONTAL_RULE", () => {
      mount<DemoEditor>(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("HORIZONTAL_RULE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });
  });

  describe("blockRenderer", () => {
    it("unstyled", () => {
      expect(
        mount<DemoEditor>(<DemoEditor extended={false} />)
          .instance()
          .blockRenderer({
            getType: () => "unstyled",
          } as ContentBlock),
      ).toBe(null);
    });

    it("no entity", () => {
      const editable = mount<DemoEditor>(
        <DemoEditor
          rawContentState={
            {
              entityMap: {},
              blocks: [
                {
                  key: "abwewe",
                  type: "atomic",
                  text: " ",
                  depth: 0,
                  entityRanges: [],
                  inlineStyleRanges: [],
                } as RawDraftContentBlock,
              ],
            } as RawDraftContentState
          }
          extended={true}
        />,
      )
        .instance()
        .blockRenderer(new ContentBlock({ type: "atomic" }))?.editable;
      expect(editable).toBe(false);
    });

    it("HORIZONTAL_RULE", () => {
      const rawContentState = {
        entityMap: {
          5: {
            type: "HORIZONTAL_RULE",
            mutability: "IMMUTABLE",
            data: {},
          },
        },
        blocks: [
          {
            key: "asa",
            type: "atomic",
            text: " ",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                key: 5,
                offset: 0,
                length: 1,
              },
            ],
          },
        ],
      } as RawDraftContentState;
      const instance = mount<DemoEditor>(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error
      expect(Component()).toEqual(<hr />);
    });

    it("IMAGE", () => {
      const rawContentState = {
        entityMap: {
          1: {
            type: "IMAGE",
            mutability: "IMMUTABLE",
            data: {
              src: "example.png",
            },
          },
        },
        blocks: [
          {
            key: "ccc",
            type: "atomic",
            text: " ",
            depth: 0,
            entityRanges: [
              {
                key: 1,
                offset: 0,
                length: 1,
              },
            ],
            inlineStyleRanges: [],
          },
        ],
      } as RawDraftContentState;

      const instance = mount<DemoEditor>(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error
      expect(<Component />).toMatchInlineSnapshot(`<Image />`);
    });

    it("SNIPPET", () => {
      const rawContentState = {
        entityMap: {
          0: {
            type: "SNIPPET",
            mutability: "IMMUTABLE",
            data: {
              src: "example.png",
            },
          },
        },
        blocks: [
          {
            key: "aaa",
            type: "atomic",
            text: " ",
            depth: 0,
            entityRanges: [
              {
                key: 0,
                offset: 0,
                length: 1,
              },
            ],
            inlineStyleRanges: [],
          },
        ],
      } as RawDraftContentState;

      const instance = mount<DemoEditor>(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error
      expect(<Component />).toMatchInlineSnapshot(`<Snippet />`);
    });
  });

  describe("handlePastedText", () => {
    it("handled by handleDraftEditorPastedText", () => {
      const wrapper = mount<DemoEditor>(<DemoEditor extended={false} />);
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
      } as RawDraftContentState;
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
      ).toBe("handled");
    });

    it("default handling", () => {
      const wrapper = mount<DemoEditor>(<DemoEditor extended={false} />);

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "this is plain text paste",
            "this is plain text paste",
            wrapper.state("editorState"),
          ),
      ).toBe("not-handled");
    });
  });

  describe("keyBindingFn", () => {
    it("works", () => {
      const wrapper = mount<DemoEditor>(<DemoEditor extended={false} />);

      wrapper.instance().onChange = jest.fn();
      // @ts-expect-error
      wrapper.instance().keyBindingFn({ keyCode: 9 });
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("does not change state directly with other keys", () => {
      const wrapper = mount<DemoEditor>(<DemoEditor extended={false} />);

      wrapper.instance().onChange = jest.fn();
      // @ts-expect-error
      wrapper.instance().keyBindingFn({ keyCode: 22 });
      expect(wrapper.instance().onChange).not.toHaveBeenCalled();
    });
  });

  describe("addBR", () => {
    let wrapper: ReactWrapper<DemoEditorProps, DemoEditorState, DemoEditor>;
    let addLineBreak: jest.SpyInstance;

    beforeEach(() => {
      wrapper = mount(<DemoEditor extended={false} />);

      addLineBreak = jest.spyOn(DraftUtils, "addLineBreak");
      jest.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      addLineBreak.mockRestore();
    });

    it("works", () => {
      // @ts-expect-error
      wrapper.instance().addBR(new MouseEvent<HTMLButtonElement>("click"));

      expect(addLineBreak).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("toggleReadOnly", () => {
    let wrapper: ReactWrapper<DemoEditorProps, DemoEditorState, DemoEditor>;

    beforeEach(() => {
      wrapper = mount(<DemoEditor extended={false} />);
    });

    it("works", () => {
      expect(wrapper.instance().state.readOnly).toBe(false);
      expect(wrapper.find(".EditorToolbar button:last-child").text()).toBe(
        "📖",
      );
      wrapper
        .instance()
        // @ts-expect-error
        .toggleReadOnly(new MouseEvent<HTMLButtonElement>("click"));
      expect(wrapper.instance().state.readOnly).toBe(true);
      expect(wrapper.find(".EditorToolbar button:last-child").text()).toBe(
        "📕",
      );
    });
  });
});
