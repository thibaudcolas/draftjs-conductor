// @flow
import React, { Component } from "react";
import "./App.css";

import DemoEditor from "../components/DemoEditor";

const copyPasteContent = {
  blocks: [
    {
      key: "8qfte",
      text: "Copy this content",
      type: "header-two",
    },
    {
      key: "6m80m",
      text: " ",
      type: "atomic",
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
    },
    {
      key: "7knr3",
      text: "From here",
      type: "header-three",
    },
    {
      key: "er6ke",
      text: "To the editor below!",
      type: "unordered-list-item",
    },
    {
      key: "47a3o",
      text: " ",
      type: "atomic",
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
    },
  ],
  entityMap: {
    "0": {
      type: "HORIZONTAL_RULE",
      mutability: "IMMUTABLE",
      data: {},
    },
    "1": {
      type: "SNIPPET",
      mutability: "IMMUTABLE",
      data: {
        text: "Content of the snippet goes here",
      },
    },
  },
};

const listNestingContent = {
  blocks: [
    {
      key: "ako0c",
      text: "Infinite",
      type: "unordered-list-item",
      depth: 0,
    },
    {
      key: "adreo",
      text: "Nested",
      type: "unordered-list-item",
      depth: 1,
    },
    {
      key: "bm3ec",
      text: "List",
      type: "unordered-list-item",
      depth: 2,
    },
    {
      key: "aqg1s",
      text: "Nesting",
      type: "unordered-list-item",
      depth: 3,
    },
    {
      key: "4dns4",
      text: "Styles",
      type: "unordered-list-item",
      depth: 4,
    },
    {
      key: "5k6tv",
      text: "Work",
      type: "unordered-list-item",
      depth: 5,
    },
    {
      key: "9htu8",
      text: "For",
      type: "unordered-list-item",
      depth: 6,
    },
    {
      key: "at7om",
      text: "As",
      type: "unordered-list-item",
      depth: 7,
    },
    {
      key: "8fddl",
      text: "Many",
      type: "unordered-list-item",
      depth: 8,
    },
    {
      key: "2ja3i",
      text: "Levels",
      type: "unordered-list-item",
      depth: 9,
    },
    {
      key: "cv49i",
      text: "As",
      type: "unordered-list-item",
      depth: 10,
    },
    {
      key: "4aoq9",
      text: "Configured",
      type: "unordered-list-item",
      depth: 11,
    },
    {
      key: "d4hhk",
      text: "Here",
      type: "unordered-list-item",
      depth: 12,
    },
    {
      key: "bbeuk",
      text: "Up",
      type: "unordered-list-item",
      depth: 13,
    },
    {
      key: "6s9a8",
      text: "To",
      type: "unordered-list-item",
      depth: 14,
    },
    {
      key: "48sq1",
      text: "15!",
      type: "unordered-list-item",
      depth: 15,
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
