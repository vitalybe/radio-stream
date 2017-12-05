import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("settings");

import { AsyncStorage } from "react-native";

let DEFAULT_USER = "radio";

class Settings {
  isLoaded = false;

  values = {
    host: null,
    user: null,
    password: null,
    isMock: null,
    isMockStartPlaying: null,
    isMockStartSettings: null,
  };

  convertValueToBool(key) {
    // noinspection EqualityComparisonWithCoercionJS
    this.values[key] = this.values[key] == "true";
  }

  async load() {
    let logger = loggerCreator("load", moduleLogger);

    for (key of Object.keys(this.values)) {
      this.values[key] = (await AsyncStorage.getItem(key)) || "";
      logger.info(`loaded setting ${key} = ${this.values[key]}`);
    }
    this.values["user"] = DEFAULT_USER;
    this.convertValueToBool("isMock");
    this.convertValueToBool("isMockStartPlaying");
    this.convertValueToBool("isMockStartSettings");
    logger.info(`loaded settings: ${JSON.stringify(this.values)}`);

    this.isLoaded = true;
  }

  async save(changedValues) {
    const logger = loggerCreator("save", moduleLogger);

    for (key of Object.keys(this.values)) {
      if (key in changedValues) {
        this.values[key] = changedValues[key];
      }

      logger.info(`saving setting ${key} = ${this.values[key]}`);
      await AsyncStorage.setItem(key, this.values[key].toString());
    }
  }
}

const settings = new Settings();
export default settings;
