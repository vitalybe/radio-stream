import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import Player from "./player"
import PlaylistCollection from "./playlist_collection"
import Settings from "./settings"

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
export default class Navigator {
    @observable activeComponent = null;

    _player = null;
    _playlistCollection = null;
    _settings = null;

    constructor() {
        this._playlistCollection = new PlaylistCollection();
        this._settings = new Settings();

        this.activeComponent = this._playlistCollection;
    }

    activatePlayer(playlist) {
        let logger = loggerCreator(this.activatePlayer.name, moduleLogger);
        logger.info(`start`);

        this._player = new Player(playlist);
        this._player.play();

        this.activeComponent = this._player;
    }

    activatePlaylistCollection() {
        let logger = loggerCreator(this.activatePlaylistCollection.name, moduleLogger);
        logger.info(`start`);

        this.activeComponent = this._playlistCollection;
    }

    activateSettings() {
        let logger = loggerCreator(this.activateSettings.name, moduleLogger);
        logger.info(`start`);

        this.activeComponent = this._settings;
    }
}