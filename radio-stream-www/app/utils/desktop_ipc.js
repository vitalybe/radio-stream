import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { ipcRenderer } from 'electron'

import player from "../stores/player"
import navigator from "../stores/navigator"
import getSettings from "../stores/settings"
import { autorun } from "mobx";

export function connect() {
// For desktop mode only
    if (!__WEB__) {

        ipcRenderer.on('native-log', function (event, msg) {
            let logger = loggerCreator("native-log", moduleLogger);
            logger.debug(msg);
        });

        ipcRenderer.on('playPauseGlobalKey', function () {
            let logger = loggerCreator("playPauseToggle", moduleLogger);

            logger.debug("received message: playPauseToggle");
            if (player && player.currentPlaylist) {
                player.togglePlayPause();
            }
        });

        ipcRenderer.on('idle', function (event, idleOutput) {
            let logger = loggerCreator("idle", moduleLogger);

            logger.debug("received idle: " + idleOutput);
            const idleSeconds = parseInt(idleOutput);

            if (idleSeconds > 3600 && player && player.isPlaying) {
                logger.debug("idle too long");
                navigator.activatePlaylistCollection();
            }

        });

        autorun(() => {
            let logger = loggerCreator("autorun-keyboard", moduleLogger);
            logger.info(`changed key: ${getSettings().playPauseKey}`);

            ipcRenderer.send("onPlayPauseKeyChanged", getSettings().playPauseKey);
        });

        autorun(() => {
            let logger = loggerCreator("autorun-keyboard", moduleLogger);
            logger.info(`changed song: ${player.song}`);

            ipcRenderer.send("onPlayerSongChanged", player.song);
        });
    }
}