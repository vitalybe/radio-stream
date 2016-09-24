import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import Playlist from "./playlist"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export class PlaylistCollection {
    @observable items = [];
    @observable loading = false;
    @observable error = false;

    _onPlaylistSelectedCallback = null;

    constructor(onPlaylistSelectedCallback) {
        this._onPlaylistSelectedCallback = onPlaylistSelectedCallback;
    }

    @action
    load() {
        let logger = loggerCreator(this.load.name, moduleLogger);
        logger.info(`start`);

        this.items.clear();
        this.loading = true;
        this.error = false;
        logger.info(`loading playlists`);
        return backendMetadataApi.playlists()
            .then(action((playlists) => {
                logger.info(`got playlists: ${playlists}`);

                let newPlaylists = playlists.map(playlistName => {
                    return new Playlist(playlistName);
                });

                this.items = observable(newPlaylists);
                this.loading = false;
            }))
            .catch(action(err => {
                this.error = true;
                this.loading = false;

                throw err;
            }));
    }

    selectPlaylist(playlistName) {
        this._onPlaylistSelectedCallback(playlistName)
    }
}