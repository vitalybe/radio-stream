import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import keycode from "keycode";

import getSettings from '../stores/settings'
import * as backendMetadataApi from '../utils/backend_metadata_api'

class SettingsModifications {

    @observable values = {
        host: "",
        password: "",
        playPauseKey: ""
    };

    @observable testState;
    @observable isTestError;

    _modifierKeys = null;

    constructor() {
        let logger = loggerCreator(this.constructor.name, moduleLogger);
        logger.info(`start`);

        this._modifierKeys = [
            keycode("left command"), keycode("right command"),
            keycode("shift"), keycode("ctrl"), keycode("alt")
        ];

        logger.info(`invalid keys: ${this._modifierKeys}`);

        this.reset();
    }

    reset() {
        this.testState = "";
        this.isTestError = false;

        this.values = getSettings().values;
    }

    save() {
        this.testState = `Connecting to ${getSettings().host}...`;
        this.isTestError = false;

        return backendMetadataApi.testConnection(this)
            .then(() => {
                this.testState = "Connection is successful";

                getSettings().save(this.values);
            })
            .catch(err => {
                this.testState = "Connection failed: " + err.toString();
                this.isTestError = true;

                getSettings().load();

                throw err;
            })

    }

    modifyPlayPauseKey(keyboardEvent) {
        let logger = loggerCreator(this.modifyPlayPauseKey.name, moduleLogger);
        logger.info(`start`);

        let name = keycode(keyboardEvent);
        let code = keyboardEvent.keyCode;
        let ctrl = keyboardEvent.ctrlKey;
        let shift = keyboardEvent.shiftKey;
        let alt = keyboardEvent.altKey;
        let meta = keyboardEvent.metaKey;

        logger.info(`[${name}] code: ${code}. ctrl: ${ctrl}. shift: ${shift}. alt: ${alt}. meta: ${meta}`)

        let keyParts = [];
        if(this._modifierKeys.indexOf(code) == -1 && name) {
            if(ctrl) keyParts.push("Ctrl")
            if(shift) keyParts.push("Shift")
            if(alt) keyParts.push("Alt")
            if(meta) keyParts.push("Cmd")

            if(name.match(/[\w]/)) {
                name = _.startCase(name).split(" ").join("")
            }
            keyParts.push(name);

            let key = keyParts.join("+")

            logger.info(`accelerator: ${key}`);
            this.values.playPauseKey = key;
        } else {
            logger.info(`modifier key`);
        }
    }
}

export default new SettingsModifications();