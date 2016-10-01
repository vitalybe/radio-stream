import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import Player from "./player"
import PlaylistCollection from "./playlist_collection"
import SettingsModifications from "./settings_modifications"

import settings from '../utils/settings'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
export default class Navigator {
    @observable activeComponentStore = null;

    _player = null;
    _playlistCollection = null;
    _settingsModifications = null;

    constructor() {
        this._playlistCollection = new PlaylistCollection();
        this._settingsModifications = new SettingsModifications();

        if(settings.host && settings.password) {
            this.activeComponentStore = this._playlistCollection;
        } else {
            this.activeComponentStore = this._settingsModifications;
        }
    }

    activatePlayer(playlist) {
        let logger = loggerCreator(this.activatePlayer.name, moduleLogger);
        logger.info(`start`);

        this._player = new Player(playlist);
        this._player.play();

        this.activeComponentStore = this._player;
    }

    activatePlaylistCollection() {
        let logger = loggerCreator(this.activatePlaylistCollection.name, moduleLogger);
        logger.info(`start`);

        this.activeComponentStore = this._playlistCollection;
    }

    activateSettings() {
        let logger = loggerCreator(this.activateSettings.name, moduleLogger);
        logger.info(`start`);

        this.activeComponentStore = this._settingsModifications;
    }
}