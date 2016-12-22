import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("settings");

import {AsyncStorage} from 'react-native'

let DEFAULT_USER = "radio";

let PERSISTENCE_HOST = "host";
let PERSISTENCE_PASSWORD = "password";

class Settings {
  _host = null;

  _user = DEFAULT_USER;

  _password = null;

  constructor() {
    let logger = loggerCreator(this.constructor.name, moduleLogger);
    logger.info(`start`);

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

  load() {
    let logger = loggerCreator("load", moduleLogger);
    logger.info(`start`);

    return AsyncStorage.getItem(PERSISTENCE_HOST)
      .then(value => {
        this._host = value;
        return AsyncStorage.getItem(PERSISTENCE_PASSWORD)
      })
      .then(value => {
        this._password = value;
      });
  }

  update(host, password) {
    let logger = loggerCreator("clone", moduleLogger);
    logger.info(`updating global settings. host: ${host}`);

    this._host = host;
    this._password = password;

    return AsyncStorage.setItem(PERSISTENCE_HOST, this.host).then(() => {
      return AsyncStorage.setItem(PERSISTENCE_PASSWORD, this.password)
    });
  }
}

export let globalSettings = new Settings();
