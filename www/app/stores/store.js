import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import { Player } from "./player"


class Store {
    @observable playlistsMetadata = new PlaylistsMetadata();
    @observable player = null;

    createPlayer(playlistName) {
        this.player = new Player(playlistName);
    }

}

export default new Store()