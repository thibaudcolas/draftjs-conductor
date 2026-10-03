import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import type { MockInstance } from "vitest";
import {
  EditorState,
  RichUtils,
  AtomicBlockUtils,
  RawDraftContentState,
  ContentBlock,
  RawDraftContentBlock,
} from "draft-js";

import DemoEditor, { DemoEditorProps } from "./DemoEditor";
import DraftUtils from "../utils/DraftUtils";

// Refs retain coverage of the editor's Draft.js callbacks while RTL mounts the DOM.
const renderEditor = (
  element: React.ReactElement<
    DemoEditorProps & React.RefAttributes<DemoEditor>
  >,
) => {
  const ref = React.createRef<DemoEditor>();
  const result = render(React.cloneElement(element, { ref }));
  return {
    instance: () => ref.current!,
    find: (selector: string) => result.container.querySelector(selector),
  };
};

describe("DemoEditor", () => {
  beforeEach(() => {
    vi.spyOn(RichUtils, "toggleInlineStyle");
    vi.spyOn(RichUtils, "toggleBlockType");
    vi.spyOn(RichUtils, "toggleLink");
    vi.spyOn(AtomicBlockUtils, "insertAtomicBlock");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders", () => {
    // Do not snapshot the Draft.js editor, as it contains unstable keys in the content.
    expect(
      renderEditor(<DemoEditor extended={false} />).find(".EditorToolbar"),
    ).toMatchSnapshot();
  });

  describe("#extended", () => {
    it("works", () => {
      expect(
        renderEditor(<DemoEditor extended />).find(".EditorToolbar"),
      ).toMatchSnapshot();
    });

    it("can take predefined content", () => {
      expect(
        renderEditor(
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
      const wrapper = renderEditor(<DemoEditor extended={false} />);

      wrapper.instance().onChange(state);

      expect(wrapper.instance().state.editorState).toBe(state);
    });
  });

  it("toggleStyle", () => {
    renderEditor(<DemoEditor extended={false} />)
      .instance()
      // @ts-expect-error - Minimal event or component fixture for this callback.
      .toggleStyle("BOLD", new Event("mousedown"));

    expect(RichUtils.toggleInlineStyle).toHaveBeenCalled();
  });

  it("toggleBlock", () => {
    renderEditor(<DemoEditor extended={false} />)
      .instance()
      // @ts-expect-error - Minimal event or component fixture for this callback.
      .toggleBlock("header-two", new Event("mousedown"));

    expect(RichUtils.toggleBlockType).toHaveBeenCalled();
  });

  describe("toggleEntity", () => {
    it("LINK", () => {
      renderEditor(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("LINK");

      expect(RichUtils.toggleLink).toHaveBeenCalled();
    });

    it("IMAGE", () => {
      renderEditor(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("IMAGE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("SNIPPET", () => {
      renderEditor(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("SNIPPET");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });

    it("HORIZONTAL_RULE", () => {
      renderEditor(<DemoEditor extended={false} />)
        .instance()
        .toggleEntity("HORIZONTAL_RULE");

      expect(AtomicBlockUtils.insertAtomicBlock).toHaveBeenCalled();
    });
  });

  describe("blockRenderer", () => {
    it("unstyled", () => {
      expect(
        renderEditor(<DemoEditor extended={false} />)
          .instance()
          .blockRenderer({
            getType: () => "unstyled",
          } as ContentBlock),
      ).toBe(null);
    });

    it("no entity", () => {
      const editable = renderEditor(
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
      const instance = renderEditor(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error - Minimal event or component fixture for this callback.
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

      const instance = renderEditor(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error - Minimal event or component fixture for this callback.
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

      const instance = renderEditor(
        <DemoEditor rawContentState={rawContentState} extended={true} />,
      ).instance();

      const Component = instance.blockRenderer(
        instance.state.editorState.getCurrentContent().getFirstBlock(),
      )!.component;
      // @ts-expect-error - Minimal event or component fixture for this callback.
      expect(<Component />).toMatchInlineSnapshot(`<Snippet />`);
    });
  });

  describe("handlePastedText", () => {
    it("handled by handleDraftEditorPastedText", () => {
      const wrapper = renderEditor(<DemoEditor extended={false} />);
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
            wrapper.instance().state.editorState,
          ),
      ).toBe("handled");
    });

    it("default handling", () => {
      const wrapper = renderEditor(<DemoEditor extended={false} />);

      expect(
        wrapper
          .instance()
          .handlePastedText(
            "this is plain text paste",
            "this is plain text paste",
            wrapper.instance().state.editorState,
          ),
      ).toBe("not-handled");
    });
  });

  describe("keyBindingFn", () => {
    it("works", () => {
      const wrapper = renderEditor(<DemoEditor extended={false} />);

      wrapper.instance().onChange = vi.fn();
      // @ts-expect-error - Minimal event or component fixture for this callback.
      wrapper.instance().keyBindingFn({ keyCode: 9 });
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });

    it("does not change state directly with other keys", () => {
      const wrapper = renderEditor(<DemoEditor extended={false} />);

      wrapper.instance().onChange = vi.fn();
      // @ts-expect-error - Minimal event or component fixture for this callback.
      wrapper.instance().keyBindingFn({ keyCode: 22 });
      expect(wrapper.instance().onChange).not.toHaveBeenCalled();
    });
  });

  describe("addBR", () => {
    let wrapper: ReturnType<typeof renderEditor>;
    let addLineBreak: MockInstance;

    beforeEach(() => {
      wrapper = renderEditor(<DemoEditor extended={false} />);

      addLineBreak = vi.spyOn(DraftUtils, "addLineBreak");
      vi.spyOn(wrapper.instance(), "onChange");
    });

    afterEach(() => {
      addLineBreak.mockRestore();
    });

    it("works", () => {
      // @ts-expect-error - Minimal event or component fixture for this callback.
      wrapper.instance().addBR(new MouseEvent<HTMLButtonElement>("click"));

      expect(addLineBreak).toHaveBeenCalled();
      expect(wrapper.instance().onChange).toHaveBeenCalled();
    });
  });

  describe("toggleReadOnly", () => {
    let wrapper: ReturnType<typeof renderEditor>;

    beforeEach(() => {
      wrapper = renderEditor(<DemoEditor extended={false} />);
    });

    it("works", () => {
      expect(wrapper.instance().state.readOnly).toBe(false);
      expect(
        wrapper.find(".EditorToolbar button:last-child")?.textContent,
      ).toBe("📖");
      wrapper
        .instance()
        // @ts-expect-error - Minimal event or component fixture for this callback.
        .toggleReadOnly(new MouseEvent<HTMLButtonElement>("click"));
      expect(wrapper.instance().state.readOnly).toBe(true);
      expect(
        wrapper.find(".EditorToolbar button:last-child")?.textContent,
      ).toBe("📕");
    });
  });
});
