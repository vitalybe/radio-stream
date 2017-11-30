import { AppRegistry } from "react-native";
import React, { Component } from "react";

import TestFairy from "react-native-testfairy";

global.process = require("process");
global.Buffer = require("buffer").Buffer;
global.process.env.NODE_ENV = __DEV__ ? "development" : "production";
global.location = {
  protocol: "file:",
};
// NOTE: Have to use `require` instead of `import` to allow the initialization of `global` beforehand. Those are needed
// for various node libraries, like `scrape-it`
const MasterPage = require("./js/app/pages/master_page/master_page").default;

class RadioStreamAndroid extends Component {
  componentWillMount() {
    TestFairy.begin("764a3f516e3fdab9f742b8aaf02f2058bd95890c");
  }

  render() {
    return <MasterPage />;
  }
}

AppRegistry.registerComponent("RadioStream", () => RadioStreamAndroid);
