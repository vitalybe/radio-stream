import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

class Settings {

    @observable values = {
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

    load() {
        this.values = this._electronSettings.getSync("values");
    }

    save(newValues) {
        this.values = _.clone(newValues);
        return this._electronSettings.setSync("values", this.values);
    }
}

var settingsInstance = null;

function getSettings() {
    if (!settingsInstance) {
        settingsInstance = new Settings();
    }

    return settingsInstance;
}

// note: i am not just returning a new instance because due to electron requiring issues in proxyquire in tests
export default getSettings;
