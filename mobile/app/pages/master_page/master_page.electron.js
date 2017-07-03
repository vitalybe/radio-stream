import loggerCreator from "../../utils/logger";
const moduleLogger = loggerCreator("RadioStreamElectron");
import React, { Component } from "react";

import MasterPage from "./master_page.js";
import ElectronIpcBrowserSide from "../../utils/electron_ipc/electron_ipc_browser_side";

export default class RadioStreamElectron extends Component {
  async componentWillMount() {
    loggerCreator("componentWillMount", moduleLogger);
    ElectronIpcBrowserSide.connect();
  }

  render() {
    loggerCreator(this.render.name, moduleLogger);
    return <MasterPage />;
  }
}
