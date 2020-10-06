// @flow
import React, { Component } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  CompositeDecorator,
  AtomicBlockUtils,
  ContentBlock,
} from "draft-js";
import type { DraftBlockType } from "draft-js/lib/DraftBlockType";
import type { DraftEntityType } from "draft-js/lib/DraftEntityType";

import {
  ListNestingStyles,
  blockDepthStyleFn,
  registerCopySource,
  handleDraftEditorPastedText,
  createEditorStateFromRaw,
  serialiseEditorStateToRaw,
} from "../../lib/index";

import SentryBoundary from "./SentryBoundary";
import Highlight from "./Highlight";
import Link, { linkStrategy } from "./Link";
import Image from "./Image";
import Snippet from "./Snippet";

import DraftUtils from "../utils/DraftUtils";

import "./DemoEditor.css";

const NestingStyles = React.memo(ListNestingStyles);

const BLOCKS = {
  "unstyled": "P",
  "unordered-list-item": "UL",
  "ordered-list-item": "OL",
  "header-one": "H1",
  "header-two": "H2",
  "header-three": "H3",
  "code-block": "{ }",
};

const BLOCKS_EXTENDED = {
  "unstyled": "P",
  "unordered-list-item": "UL",
  "ordered-list-item": "OL",
  "header-one": "H1",
  "header-two": "H2",
  "header-three": "H3",
  "header-four": "H4",
  "header-five": "H5",
  "header-six": "H6",
  "blockquote": "❝",
  "code-block": "{ }",
};

const STYLES = {
  BOLD: "B",
  ITALIC: "I",
};

const STYLES_EXTENDED = {
  BOLD: "B",
  ITALIC: "I",
  CODE: "`",
  STRIKETHROUGH: "~",
  UNDERLINE: "_",
};

const ENTITIES = [
  {
    type: "LINK",
    label: "🔗",
    attributes: ["url"],
    whitelist: {
      href: "^(http:|https:|undefined$)",
    },
  },
  {
    type: "IMAGE",
    label: "📷",
    attributes: ["src"],
    whitelist: {
      src: "^http",
    },
  },
  {
    type: "SNIPPET",
    label: "🌱",
    attributes: ["text"],
    whitelist: {},
  },
  {
    type: "HORIZONTAL_RULE",
    label: "HR",
    attributes: [],
    whitelist: {},
  },
];

const MAX_LIST_NESTING = 15;

type Props = {
  rawContentState: ?{},
  extended: boolean,
};

type State = {
  editorState: EditorState,
  readOnly: boolean,
};

/* :: import type { ElementRef } from "react"; */

/**
 * Demo editor.
 */
class DemoEditor extends Component<Props, State> {
  /* :: editorRef: ?ElementRef<Editor>; */
  /* :: copySource: { unregister: () => void }; */

  static defaultProps = {
    rawContentState: null,
  };

  constructor(props: Props) {
    super(props);
    const { rawContentState } = props;

    const decorator = new CompositeDecorator([
      {
        strategy: linkStrategy,
        component: Link,
      },
    ]);

    this.state = {
      // $FlowFixMe Unclear why the decorator API disagrees with itself.
      editorState: createEditorStateFromRaw(rawContentState, decorator),
      readOnly: false,
    };

    this.onChange = this.onChange.bind(this);
    this.onTab = this.onTab.bind(this);
    this.addBR = this.addBR.bind(this);
    this.toggleReadOnly = this.toggleReadOnly.bind(this);
    this.toggleStyle = this.toggleStyle.bind(this);
    this.toggleBlock = this.toggleBlock.bind(this);
    this.toggleEntity = this.toggleEntity.bind(this);
    this.blockRenderer = this.blockRenderer.bind(this);
    this.handlePastedText = this.handlePastedText.bind(this);
  }

  componentDidMount() {
    this.copySource = registerCopySource(this.editorRef);
  }

  componentWillUnmount() {
    this.copySource.unregister();
  }

  /* :: onChange: (nextState: EditorState) => void; */
  onChange(nextState: EditorState) {
    this.setState({ editorState: nextState });
  }

  /* :: toggleStyle: (type: string, e: Event) => void; */
  toggleStyle(type: string, e: Event) {
    const { editorState } = this.state;
    this.onChange(RichUtils.toggleInlineStyle(editorState, type));

    e.preventDefault();
  }

  /* :: toggleBlock: (type: string, e: Event) => void; */
  toggleBlock(type: DraftBlockType, e: Event) {
    const { editorState } = this.state;
    this.onChange(RichUtils.toggleBlockType(editorState, type));

    e.preventDefault();
  }

  /* :: toggleEntity: (type: DraftEntityType | "HORIZONTAL_RULE" | "SNIPPET") => void; */
  toggleEntity(type: DraftEntityType | "HORIZONTAL_RULE" | "SNIPPET") {
    const { editorState } = this.state;
    let content = editorState.getCurrentContent();

    if (type === "IMAGE") {
      content = content.createEntity(type, "IMMUTABLE", {
        src:
          "https://thibaudcolas.github.io/draftjs-conductor/wysiwyg-magic-wand.png",
      });
      const entityKey = content.getLastCreatedEntityKey();
      this.onChange(
        AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, " "),
      );
    } else if (type === "SNIPPET") {
      // $FlowFixMe
      content = content.createEntity(type, "IMMUTABLE", {
        text: "Content of the snippet goes here",
      });
      const entityKey = content.getLastCreatedEntityKey();
      this.onChange(
        AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, " "),
      );
    } else if (type === "HORIZONTAL_RULE") {
      // $FlowFixMe
      content = content.createEntity(type, "IMMUTABLE", {});
      const entityKey = content.getLastCreatedEntityKey();
      this.onChange(
        AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, " "),
      );
    } else {
      content = content.createEntity(type, "MUTABLE", {
        url: "http://www.example.com/",
      });
      const entityKey = content.getLastCreatedEntityKey();
      const selection = editorState.getSelection();
      this.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
    }
  }

  /* :: blockRenderer: (block: ContentBlock) => { component: typeof Component, editable: boolean }; */
  blockRenderer(block: ContentBlock) {
    const { editorState } = this.state;
    const content = editorState.getCurrentContent();

    if (block.getType() !== "atomic") {
      return null;
    }

    const entityKey = block.getEntityAt(0);

    if (!entityKey) {
      return {
        editable: false,
      };
    }

    const entity = content.getEntity(entityKey);

    if (entity.getType() === "HORIZONTAL_RULE") {
      return {
        component: () => <hr />,
        editable: false,
      };
    }

    if (entity.getType() === "SNIPPET") {
      return {
        component: Snippet,
        editable: false,
      };
    }

    return {
      component: Image,
      editable: false,
    };
  }

  /* :: handlePastedText: (text: string, html: ?string, editorState: EditorState) => boolean; */
  handlePastedText(text: string, html: ?string, editorState: EditorState) {
    let newState = handleDraftEditorPastedText(html, editorState);

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  }

  /* :: onTab: (event: SyntheticKeyboardEvent<>) => void; */
  onTab(event: SyntheticKeyboardEvent /*:: <> */) {
    const { editorState } = this.state;
    const newState = RichUtils.onTab(event, editorState, MAX_LIST_NESTING);

    this.onChange(newState);
  }

  /* :: addBR: (e: Event) => void; */
  addBR(e: Event) {
    const { editorState } = this.state;
    this.onChange(DraftUtils.addLineBreak(editorState));

    e.preventDefault();
  }

  /* :: toggleReadOnly: (e: Event) => void; */
  toggleReadOnly(e: Event) {
    this.setState(({ readOnly }: State) => ({ readOnly: !readOnly }));

    e.preventDefault();
  }

  render() {
    const { extended } = this.props;
    const { editorState, readOnly } = this.state;
    const styles = extended ? STYLES_EXTENDED : STYLES;
    const blocks = extended ? BLOCKS_EXTENDED : BLOCKS;

    return (
      <div className="DemoEditor">
        <SentryBoundary>
          <div className="EditorToolbar">
            {Object.keys(styles).map((type) => (
              <button
                key={type}
                onMouseDown={this.toggleStyle.bind(this, type)}
              >
                {STYLES_EXTENDED[type]}
              </button>
            ))}
            {Object.keys(blocks).map((type) => (
              <button
                key={type}
                onMouseDown={this.toggleBlock.bind(this, type)}
              >
                {BLOCKS_EXTENDED[type]}
              </button>
            ))}
            {ENTITIES.map((type) => (
              <button
                key={type.type}
                onMouseDown={this.toggleEntity.bind(this, type.type)}
              >
                {type.label}
              </button>
            ))}
            <button onMouseDown={this.addBR}>BR</button>
            <button onMouseDown={this.toggleReadOnly}>
              {readOnly ? "📕" : "📖"}
            </button>
          </div>
          <Editor
            ref={(ref) => {
              this.editorRef = ref;
            }}
            editorState={editorState}
            readOnly={readOnly}
            onChange={this.onChange}
            stripPastedStyles={false}
            blockRendererFn={this.blockRenderer}
            blockStyleFn={blockDepthStyleFn}
            onTab={this.onTab}
            handlePastedText={this.handlePastedText}
          />
        </SentryBoundary>
        <NestingStyles max={MAX_LIST_NESTING} />
        <details>
          <summary>
            <span className="link">Debug</span>
          </summary>
          <Highlight
            value={JSON.stringify(
              serialiseEditorStateToRaw(editorState),
              null,
              2,
            )}
          />
        </details>
      </div>
    );
  }
}

export default DemoEditor;
