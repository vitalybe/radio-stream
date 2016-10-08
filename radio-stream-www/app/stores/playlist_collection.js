import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import retries from "../utils/retries"

import Playlist from "../domain/playlist"
import * as backendMetadataApi from '../utils/backend_metadata_api'

class PlaylistCollection {
    @observable items = [];

    @observable loading = false;
    @observable retryCount = 0;

    constructor() {
    }

    @action
    load() {
        let logger = loggerCreator(this.load.name, moduleLogger);
        logger.info(`start`);

        this.items.clear();
        this.loading = true;
        this.error = false;
        logger.info(`loading playlists`);

        return retries.promiseRetry(backendMetadataApi.playlists)
            .then(action((playlists) => {
                logger.info(`got playlists: ${playlists}`);

                let newPlaylists = playlists.map(playlistName => {
                    return new Playlist(playlistName);
                });

                this.items = observable(newPlaylists);
                this.loading = false;
            }));
    }
}

export default new PlaylistCollection();