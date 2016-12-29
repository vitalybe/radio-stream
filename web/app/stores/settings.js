import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

export class Settings {

    _values = {
        host: "",
        password: "",
        playPauseKey: ""
    };

    // i am unable to get proxyquire, in tests, to require electron, so I have to hide it inside
    _electronSettings = require('electron-settings');

    constructor() {
        let logger = loggerCreator(this.constructor.name, moduleLogger);
        logger.info(`start`);

        this.load();
    }

    get values() {
        return this._values;
    }

    get address() {
        if(this._values.host) {
          return `http://${this._values.host}/radio-stream/`
        } else {
          return null;
        }
    }

    get password() {
        return this._values.password;
    }

    get playPauseKey() {
      return this._values.playPauseKey;
    }

    update(newValues) {
        this._values = _.clone(newValues);
    }

    load() {
        this._values = this._electronSettings.getSync("values");
    }

    save() {
       return this._electronSettings.setSync("values", this.values);
    }
}

// note: we can't export a new instance because due to electron requiring issues in proxyquire in tests
let settingsInstance = null;
export function getSettings() {
    if (!settingsInstance) {
        settingsInstance = new Settings();
    }

    return settingsInstance;
}
