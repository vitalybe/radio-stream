import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";

import Player from "../stores/player"
import PlaylistCollection from "../stores/playlist_collection"
import SettingsModifications from "../stores/settings_modifications"

import settings from '../utils/settings'

class Store {
    @observable activeComponentStore = null;

    player = null; // initiated via navigator
    playlistCollection = new PlaylistCollection();
    settingsModifications = new SettingsModifications();

    fatalErrorMessage = "";

    constructor() {
        if(settings.host && settings.password) {
            this.activeComponentStore = this.playlistCollection;
        } else {
            this.activeComponentStore = this.settingsModifications;
        }
    }
}

export default new Store();