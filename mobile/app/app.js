import loggerCreator from "./utils/logger";
const moduleLogger = loggerCreator("app");

import React, { Component } from "react";
import { StyleSheet, Image, Dimensions, View } from "react-native";

import settings from "./utils/settings/settings";
import settingsNative from "./utils/settings/settings_native";
import MasterFramePage from "./pages/master_frame_page/master_frame_page";

export default class RadioStream extends Component {
  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);

    const { height, width } = Dimensions.get("window");
    moduleLogger.info(`available dimensions: width=${width} height=${height}`);

    this.state = {
      ready: false,
    };

    logger.info(`loading settings`);
    await settings.load();
    await settingsNative.load();

    logger.info(`settings loaded`);
    this.setState({ ready: true });
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);

    return this.state.ready ? <MasterFramePage /> : null;
  }
}
