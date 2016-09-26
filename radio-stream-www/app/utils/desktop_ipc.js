import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

import store from "../stores/navigator"

export function connect() {
// For desktop mode only
    if (!__WEB__) {

        require('ipc').on('log', function (msg) {
            logger.debug(msg);
        });

        require('ipc').on('playPauseToggle', function () {
            logger.debug("received message: playPauseToggle");
            if (store.player) {
                store.player.togglePlayPause();
            }
        });

        require('ipc').on('idle', function (idleOutput) {
            // logger.debug("received idle: " + idleOutput);
            const idleSeconds = parseInt(idleOutput);

            if (idleSeconds > 180 && store.player && store.player.isPlaying) {
                logger.debug("idle too long - pausing song");
                store.player.pause();
            }

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