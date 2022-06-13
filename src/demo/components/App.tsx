import { Component } from "react";

import "./App.css";

import DemoEditor from "../components/DemoEditor";
import { RawDraftContentState } from "draft-js";

const copyPasteContent = {
  blocks: [
    {
      key: "8qfte",
      text: "Copy this content",
      type: "header-two",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: "6m80m",
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
    {
      key: "c0ala",
      text: "",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: "7knr3",
      text: "From here",
      type: "header-three",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: "er6ke",
      text: "To the editor below!",
      type: "ordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: "47a3o",
      text: " ",
      type: "atomic",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [
        {
          offset: 0,
          length: 1,
          key: 1,
        },
      ],
    },
    {
      key: "826u0",
      text: "Numbered list",
      type: "ordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
  ],
  entityMap: {
    2: {
      type: "HORIZONTAL_RULE",
      mutability: "IMMUTABLE",
      data: {},
    },
    1: {
      type: "SNIPPET",
      mutability: "IMMUTABLE",
      data: {
        text: "Content of the snippet goes here",
      },
    },
  },
} as RawDraftContentState;

const listNestingContent = {
  blocks: [
    {
      key: "ako0c",
      text: "Infinite",
      type: "ordered-list-item",
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "adreo",
      text: "Nested",
      type: "ordered-list-item",
      depth: 1,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "bm3ec",
      text: "List",
      type: "ordered-list-item",
      depth: 2,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "aqg1s",
      text: "Nesting",
      type: "ordered-list-item",
      depth: 3,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "4dns4",
      text: "Styles",
      type: "ordered-list-item",
      depth: 4,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "5k6tv",
      text: "Work",
      type: "ordered-list-item",
      depth: 5,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "9htu8",
      text: "For",
      type: "ordered-list-item",
      depth: 6,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "at7om",
      text: "As",
      type: "ordered-list-item",
      depth: 7,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "8fddl",
      text: "Many",
      type: "ordered-list-item",
      depth: 8,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "2ja3i",
      text: "Levels",
      type: "ordered-list-item",
      depth: 9,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "cv49i",
      text: "As",
      type: "ordered-list-item",
      depth: 10,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "4aoq9",
      text: "Configured",
      type: "ordered-list-item",
      depth: 11,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "d4hhk",
      text: "Here",
      type: "ordered-list-item",
      depth: 12,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "bbeuk",
      text: "Up",
      type: "ordered-list-item",
      depth: 13,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "6s9a8",
      text: "To",
      type: "ordered-list-item",
      depth: 14,
      entityRanges: [],
      inlineStyleRanges: [],
    },
    {
      key: "48sq1",
      text: "15!",
      type: "ordered-list-item",
      depth: 15,
      entityRanges: [],
      inlineStyleRanges: [],
    },
  ],
  entityMap: {},
};

class App extends Component<{}> {
  render() {
    return (
      <div className="App">
        <h2>Idempotent copy-paste between editors</h2>
        <p>
          The default Draft.js copy-paste handlers lose a lot of the formatting
          when copy-pasting between Draft.js editors. While this might be ok for
          some use cases, sites with multiple editors on the same page need them
          to reliably support copy-paste.
        </p>
        <DemoEditor extended={true} rawContentState={copyPasteContent} />
        <DemoEditor extended={false} />
        <h2>Infinite list nesting</h2>
        <p>
          By default, Draft.js only provides support for 5 list levels for
          bulleted and numbered lists. While this is often more than enough,
          some editors need to go further. This provides infinite list nesting
          styles.
        </p>
        <DemoEditor extended={false} rawContentState={listNestingContent} />
      </div>
    );
  }
}

export default App;
