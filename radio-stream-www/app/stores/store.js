import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import { Player } from "./player"
import { PlaylistCollection } from "./playlist_collection"


class Store {
    @observable player = null;

    playlistMetadataCollection = new PlaylistCollection(this._onPlaylistSelected.bind(this));

    _onPlaylistSelected(playlist) {
        this.player = new Player(playlist, this._onPlayerStopped.bind(this));
        this.player.play();
    }

    _onPlayerStopped() {
        let logger = loggerCreator(this._onPlayerStopped.name, moduleLogger);
        logger.info(`start`);

        this.player = null;
    }
}

export default new Store()