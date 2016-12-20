import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("settings");

let DEFAULT_USER = "radio";

class Settings {

  _host = "where-is-my-music-vf7bm.duckdns.org/5f707e4f-97cc-438e-90d8-1e5e35bd558a/";

  _user = DEFAULT_USER;
  _password = "myman";

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
    // TBD
  }

  save(host, password) {
    // TBD
  }
}

export default new Settings();