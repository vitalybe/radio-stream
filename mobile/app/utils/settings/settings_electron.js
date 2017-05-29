import loggerCreator from "../logger";
const moduleLogger = loggerCreator("SettingsElectron");

import { AsyncStorage } from "react-native";

let PERSISTENCE_PLAY_PAUSE_KEY = "playPauseKey";

class SettingsElectron {
  constructor() {
    let logger = loggerCreator(this.constructor.name, moduleLogger);

    this.playPauseKey = null;

    this.load();
  }

  async load() {
    let logger = loggerCreator("load", moduleLogger);

    this.playPauseKey = (await AsyncStorage.getItem(PERSISTENCE_PLAY_PAUSE_KEY)) || "";
  }

  async save() {
    await AsyncStorage.setItem(PERSISTENCE_PLAY_PAUSE_KEY, this.playPauseKey);
  }
}

const settingsElectron = new SettingsElectron();
export default settingsElectronc;
