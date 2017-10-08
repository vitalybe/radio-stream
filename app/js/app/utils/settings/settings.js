import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("settings");

import { AsyncStorage } from "react-native";

let DEFAULT_USER = "radio";

let PERSISTENCE_HOST = "host";
let PERSISTENCE_PASSWORD = "password";

class Settings {
  constructor() {
    let logger = loggerCreator(this.constructor.name, moduleLogger);

    this.host = null;
    this.user = DEFAULT_USER;
    this.password = null;
  }

  async load() {
    let logger = loggerCreator("load", moduleLogger);

    this.host = (await AsyncStorage.getItem(PERSISTENCE_HOST)) || "";
    this.password = (await AsyncStorage.getItem(PERSISTENCE_PASSWORD)) || "";
  }

  async save() {
    await AsyncStorage.setItem(PERSISTENCE_HOST, this.host);
    await AsyncStorage.setItem(PERSISTENCE_PASSWORD, this.password);
  }
}

const settings = new Settings();
export default settings;
