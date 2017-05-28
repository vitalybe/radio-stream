import loggerCreator from "../utils/logger";
const moduleLogger = loggerCreator("settings");

import { AsyncStorage } from "react-native";

let DEFAULT_USER = "radio";

let PERSISTENCE_HOST = "host";
let PERSISTENCE_PASSWORD = "password";

class Settings {
  constructor() {
    let logger = loggerCreator(this.constructor.name, moduleLogger);

    this._host = null;
    this._user = DEFAULT_USER;
    this._password = null;

    this.load();
  }

  get host() {
    return this._host;
  }

  get user() {
    return this._user;
  }

  get password() {
    return this._password;
  }

  async load() {
    let logger = loggerCreator("load", moduleLogger);

    this._host = (await AsyncStorage.getItem(PERSISTENCE_HOST)) || "";
    this._password = (await AsyncStorage.getItem(PERSISTENCE_PASSWORD)) || "";
  }

  async save() {
    await AsyncStorage.setItem(PERSISTENCE_HOST, this.host);
    await AsyncStorage.setItem(PERSISTENCE_PASSWORD, this.password);
  }

  update(host, password) {
    let logger = loggerCreator("clone", moduleLogger);
    logger.info(`updating global settings. host: ${host}`);

    this._host = host;
    this._password = password;
  }
}

const settings = new Settings();
export default settings;
