import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

import * as actionTypes from '../actions/action_types'
import * as musicActions from '../actions/music_actions';
import storeContainer from '../utils/store_container'

// For desktop mode only
if(!__WEB__) {

    require('ipc').on('log', function(msg) {
        logger.debug(msg);
    });

    require('ipc').on('playPauseToggle', function() {
        logger.debug("received message: playPauseToggle");

        var state = storeContainer.store.getState();

        let currentPlaylist = state.currentPlaylist;
        let currentSong = state.currentSongAsync.data;

        let action = musicActions.playTogglePlaylistAction(currentPlaylist.name, currentSong);
        storeContainer.store.dispatch(action);
    });

}