// @flow
import React, { Component } from "react";
import "./App.css";

import DemoEditor from "../components/DemoEditor";

class App extends Component<{}> {
  render() {
    return (
      <div className="App">
        <DemoEditor extended={false} />
      </div>
    );
  }
}

export default App;
