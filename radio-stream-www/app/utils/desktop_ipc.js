import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { ipcRenderer } from 'electron'

import player from "../stores/player"
import getSettings from "../stores/settings"
import { autorun } from "mobx";

export function connect() {
// For desktop mode only
    if (!__WEB__) {

        require('ipc').on('native-log', function (msg) {
            let logger = loggerCreator("native-log", moduleLogger);
            logger.debug(msg);
        });

        require('ipc').on('playPauseGlobalKey', function () {
            let logger = loggerCreator("playPauseToggle", moduleLogger);

            logger.debug("received message: playPauseToggle");
            if (player && player.currentPlaylist) {
                player.togglePlayPause();
            }
        });

        require('ipc').on('idle', function (idleOutput) {
            let logger = loggerCreator("idle", moduleLogger);

            // logger.debug("received idle: " + idleOutput);
            const idleSeconds = parseInt(idleOutput);

            if (idleSeconds > 180 && player && player.isPlaying) {
                logger.debug("idle too long - pausing song");
                player.pause();
            }

        });

        autorun(() => {
            let logger = loggerCreator("autorun-keyboard", moduleLogger);
            logger.info(`changed key: ${getSettings().playPauseKey}`);

            ipcRenderer.send("onPlayPauseKeyChanged", getSettings().playPauseKey);
        });

        // TODO: replace/remove
        //const ipcRenderer = require('electron').ipcRenderer;
        //observeStore(state => ({
        //    currentSong: state.currentSongAsync.data,
        //    artistImage: state.currentArtistImage
        //}), data => {
        //    if (data.currentSong) {
        //        ipcRenderer.send('song-changed', {...data.currentSong, artistImage: data.artistImage});
        //    } else {
        //        ipcRenderer.send('song-changed', null);
        //    }
        //});

    }
}