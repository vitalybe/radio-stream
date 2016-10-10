import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import player from "../stores/player"
import playlistCollection from "../stores/playlist_collection"
import settingsModifications from "../stores/settings_modifications"

import getSettings from '../utils/settings'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
class Navigator {

    @observable activeComponentStore = null;
    @observable fatalErrorMessage = null;

    constructor() {
        if (getSettings().host && getSettings().password) {
            this.activeComponentStore = playlistCollection;
        } else {
            this.activeComponentStore = settingsModifications;
        }
    }

    activatePlayer(playlist) {
        let logger = loggerCreator(this.activatePlayer.name, moduleLogger);
        logger.info(`start`);

        player.changePlaylist(playlist);
        player.play();
        this.activeComponentStore = player;
    }

    activatePlaylistCollection() {
        let logger = loggerCreator(this.activatePlaylistCollection.name, moduleLogger);
        logger.info(`start`);

        this.activeComponentStore = playlistCollection;
    }

    activateSettings() {
        let logger = loggerCreator(this.activateSettings.name, moduleLogger);
        logger.info(`start`);

        this.activeComponentStore = settingsModifications;
    }

    activateFatalError(errorMessage) {
        let logger = loggerCreator(this.activateFatalError.name, moduleLogger);
        logger.info(`start`);

        this.fatalErrorMessage = errorMessage;
    }
}

export default new Navigator();