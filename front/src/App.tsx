import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import AppRouter from "./Routes";

class App extends Component {
  render() {
    return (
      <div>
        <AppRouter />
      </div>
    );
  }
}

export default App;
