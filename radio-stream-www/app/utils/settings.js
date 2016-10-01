import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
let electronSettings = require('electron-settings');

class Settings {

    constructor() {
        let logger = loggerCreator(this.constructor.name, moduleLogger);
        logger.info(`start`);

        this.host = null;
        this.password = null;

        this.load();
    }

    load() {
        let values = electronSettings.getSync("values");
        if (values) {
            if (values.host) {
                this.host = values.host;
            }

            if (values.password) {
                this.password = values.password;
            }
        }
    }

    save() {
        return electronSettings.setSync("values", {host: this.host, password: this.password});
    }
}

export default new Settings();
