// @flow
import React, { Component } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  CompositeDecorator,
  AtomicBlockUtils,
  ContentBlock,
  convertFromRaw,
} from "draft-js";
import type { DraftBlockType } from "draft-js/lib/DraftBlockType.js.flow";
import type { DraftEntityType } from "draft-js/lib/DraftEntityType.js.flow";

import { ListNestingStyles, blockDepthStyleFn } from "../../lib/index";
import {
  registerCopySource,
  unregisterCopySource,
  handleDraftEditorPastedText,
} from "../../lib/copypaste";

import SentryBoundary from "./SentryBoundary";
import Highlight from "./Highlight";
import Link, { linkStrategy } from "./Link";
import Image from "./Image";

import "./DemoEditor.css";

const BLOCKS = {
  unstyled: "P",
  "unordered-list-item": "UL",
  "ordered-list-item": "OL",
  "header-one": "H1",
  "header-two": "H2",
  "header-three": "H3",
  "code-block": "{ }",
};

const BLOCKS_EXTENDED = {
  unstyled: "P",
  "unordered-list-item": "UL",
  "ordered-list-item": "OL",
  "header-one": "H1",
  "header-two": "H2",
  "header-three": "H3",
  "header-four": "H4",
  "header-five": "H5",
  "header-six": "H6",
  blockquote: "❝",
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
    type: "HORIZONTAL_RULE",
    label: "HR",
    attributes: [],
    whitelist: {},
  },
];

const MAX_LIST_NESTING = 15;

type Props = {
  extended: boolean,
};

type State = {
  editorState: EditorState,
};

/**
 * Demo editor.
 */
class DemoEditor extends Component<Props, State> {
  editorRef: ?Object;

  constructor(props: Props) {
    super(props);
    const { extended } = props;

    const decorator = new CompositeDecorator([
      {
        strategy: linkStrategy,
        component: Link,
      },
    ]);

    const save = window.sessionStorage.getItem("extended");
    let editorState;

    if (extended && save) {
      const content = convertFromRaw(JSON.parse(save));
      // $FlowFixMe
      editorState = EditorState.createWithContent(content, decorator);
    } else {
      // $FlowFixMe
      editorState = EditorState.createEmpty(decorator);
    }

    this.state = {
      editorState: editorState,
    };
    (this: any).onChange = this.onChange.bind(this);
    (this: any).onTab = this.onTab.bind(this);
    (this: any).toggleStyle = this.toggleStyle.bind(this);
    (this: any).toggleBlock = this.toggleBlock.bind(this);
    (this: any).toggleEntity = this.toggleEntity.bind(this);
    (this: any).blockRenderer = this.blockRenderer.bind(this);
    (this: any).handlePastedText = this.handlePastedText.bind(this);
  }

  componentDidMount() {
    registerCopySource(this.editorRef);
  }

  componentWillUnmount() {
    unregisterCopySource(this.editorRef);
  }

  onChange(nextState: EditorState) {
    this.setState({ editorState: nextState });

    window.sessionStorage.setItem(
      `content`,
      JSON.stringify(convertToRaw(nextState.getCurrentContent())),
    );
  }

  toggleStyle(type: string, e: Event) {
    const { editorState } = this.state;
    this.onChange(RichUtils.toggleInlineStyle(editorState, type));

    e.preventDefault();
  }

  toggleBlock(type: DraftBlockType, e: Event) {
    const { editorState } = this.state;
    this.onChange(RichUtils.toggleBlockType(editorState, type));

    e.preventDefault();
  }

  toggleEntity(type: DraftEntityType | "HORIZONTAL_RULE") {
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

    return {
      component: Image,
      editable: false,
    };
  }

  handlePastedText(text: string, html: ?string, editorState: EditorState) {
    let newState = handleDraftEditorPastedText(
      this.editorRef,
      text,
      html,
      editorState,
    );

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  }

  onTab(event: SyntheticKeyboardEvent<>) {
    const { editorState } = this.state;
    const newState = RichUtils.onTab(event, editorState, MAX_LIST_NESTING);

    this.onChange(newState);
  }

  render() {
    const { extended } = this.props;
    const { editorState } = this.state;
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
          </div>
          <Editor
            ref={(ref) => {
              this.editorRef = ref;
            }}
            editorState={editorState}
            onChange={this.onChange}
            stripPastedStyles={false}
            blockRendererFn={this.blockRenderer}
            blockStyleFn={blockDepthStyleFn}
            onTab={this.onTab}
            handlePastedText={this.handlePastedText}
          />
        </SentryBoundary>
        <ListNestingStyles max={MAX_LIST_NESTING} />
        <details>
          <summary>
            <span className="link">Debug</span>
          </summary>
          <Highlight
            language="js"
            value={JSON.stringify(
              convertToRaw(editorState.getCurrentContent()),
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
