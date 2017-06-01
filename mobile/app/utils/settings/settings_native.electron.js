import loggerCreator from "../logger";
const moduleLogger = loggerCreator("SettingsNative");

import { AsyncStorage } from "react-native";
import { ipcRenderer } from "electron";

let PERSISTENCE_PLAY_PAUSE_KEY = "playPauseKey";

class SettingsNative {
  constructor() {
    let logger = loggerCreator(this.constructor.name, moduleLogger);

    this.playPauseKey = null;
  }

  async load() {
    let logger = loggerCreator("load", moduleLogger);

    this.playPauseKey = (await AsyncStorage.getItem(PERSISTENCE_PLAY_PAUSE_KEY)) || "";
  }

  async save({ playPauseKey }) {
    let logger = loggerCreator("save", moduleLogger);
    logger.info(`playPauseKey: ${playPauseKey}`);
    this.playPauseKey = playPauseKey;
    await AsyncStorage.setItem(PERSISTENCE_PLAY_PAUSE_KEY, playPauseKey);

    ipcRenderer.send("onPlayPauseKeyChanged", playPauseKey);
  }
}

export default new SettingsNative();
