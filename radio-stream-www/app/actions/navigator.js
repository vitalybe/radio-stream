import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import store from '../stores/store'

import Player from "../stores/player"

import settings from '../utils/settings'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
class Navigator {

    activatePlayer(playlist) {
        let logger = loggerCreator(this.activatePlayer.name, moduleLogger);
        logger.info(`start`);

        store.player = new Player(playlist);
        store.player.play();

        store.activeComponentStore = store.player;
    }

    activatePlaylistCollection() {
        let logger = loggerCreator(this.activatePlaylistCollection.name, moduleLogger);
        logger.info(`start`);

        store.activeComponentStore = store.playlistCollection;
    }

    activateSettings() {
        let logger = loggerCreator(this.activateSettings.name, moduleLogger);
        logger.info(`start`);

        store.activeComponentStore = store.settingsModifications;
    }

    activateFatalError(errorMessage) {
        let logger = loggerCreator(this.activateFatalError.name, moduleLogger);
        logger.info(`start`);

        store.fatalErrorMessage = errorMessage;
    }
}

export default new Navigator();