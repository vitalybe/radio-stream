import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import getSettings from '../utils/settings'
import * as backendMetadataApi from '../utils/backend_metadata_api'

class SettingsModifications {

    @observable host;
    @observable password;

    @observable testState;
    @observable isError;

    constructor() {
        let logger = loggerCreator(this.constructor.name, moduleLogger);
        logger.info(`start`);

        this.reset();
    }

    reset() {
        this.testState = "";
        this.isError = false;

        this.host = getSettings().host;
        this.password = getSettings().password;
    }

    save() {
        getSettings().host = this.host;
        getSettings().password = this.password;

        this.testState = `Connecting to ${getSettings().host}...`
        this.isError = false;

        return backendMetadataApi.playlists()
            .then(() => {
                this.testState = "Connection is successful"

                getSettings().save();
            })
            .catch(err => {
                this.testState = "Connection failed"
                this.isError = true;

                getSettings().load();

                throw err;
            })

    }
}

export default new SettingsModifications();