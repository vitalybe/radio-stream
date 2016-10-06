import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import promiseRetry from "promise-retry";

import Playlist from "./playlist"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export default class PlaylistCollection {
    @observable items = [];

    @observable loading = false;
    @observable retryCount = 0;

    constructor() {
    }

    _fetchPlaylists() {
        return promiseRetry((retry, number) => {
            let logger = loggerCreator(this._fetchPlaylists.name, moduleLogger);
            logger.info(`start. try number: ${number}`);

            this.retryCount = retry;
            return backendMetadataApi.playlists().catch(err => {
                logger.warn(`fetch failed... retrying: ${err}`);
                retry();
            })

        }, {retries: 100})
    }

    @action
    load() {
        let logger = loggerCreator(this.load.name, moduleLogger);
        logger.info(`start`);

        this.items.clear();
        this.loading = true;
        this.error = false;
        logger.info(`loading playlists`);

        return this._fetchPlaylists().then(action((playlists) => {
                logger.info(`got playlists: ${playlists}`);

                let newPlaylists = playlists.map(playlistName => {
                    return new Playlist(playlistName);
                });

                this.items = observable(newPlaylists);
                this.loading = false;
            }));
    }
}