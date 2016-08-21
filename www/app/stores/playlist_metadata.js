import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import * as backendMetadataApi from '../utils/backend_metadata_api'

class PlaylistMetadata {
    @observable name = null;
}

class PlaylistsMetadata {
    @observable items = [];
    @observable loading = false;
    @observable error = false;

    @action
    loadAvailablePlaylists() {
        let logger = loggerCreator(this.loadAvailablePlaylists.name, loggerCreator);
        logger.debug("Loading...");

        this.items.clear();
        this.loading = true;
        this.error = false;
        backendMetadataApi.playlists()
            .then(action((playlists) => {
                logger.debug(`Success`);

                let newPlaylists = playlists.map(playlistName => {
                    let playlistMetadata = new PlaylistMetadata();
                    playlistMetadata.name = playlistName;
                    return playlistMetadata;
                });

                this.items = observable(newPlaylists);
                this.loading = false;
            }))
            .catch(action(err => {
                logger.error(`Failed: ${err}`);
                this.error = true;
                this.loading = false;
            }));
    }
}