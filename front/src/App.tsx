import React, { Component } from "react";
import "./assets/styles/App.css";
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
