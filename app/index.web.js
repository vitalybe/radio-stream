import React, { Component } from "react";
import { AppRegistry } from "react-native";

import MasterPage from "./app/pages/master_page/master_page";

class RadioStreamWeb extends Component {
  render() {
    return <MasterPage />;
  }
}

AppRegistry.registerComponent("ReactNativeWeb", () => RadioStreamWeb);
AppRegistry.runApplication("ReactNativeWeb", { rootTag: document.getElementById("react-app") });
