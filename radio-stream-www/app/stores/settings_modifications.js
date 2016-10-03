import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import settings from '../utils/settings'
import * as backendMetadataApi from '../utils/backend_metadata_api'

export default class SettingsModifications {

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

        this.host = settings.host;
        this.password = settings.password;
    }

    save() {
        settings.host = this.host;
        settings.password = this.password;

        this.testState = `Connecting to ${settings.host}...`
        this.isError = false;

        return backendMetadataApi.playlists()
            .then(() => {
                this.testState = "Connection is successful"

                settings.save();
            })
            .catch(err => {
                this.testState = "Connection failed"
                this.isError = true;

                settings.load();

                throw err;
            })

    }
}
