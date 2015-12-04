import Freezer from 'freezer-js';
import * as actionTypes from './actions/types';
import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

class AsyncState {
    inProgress = true;
    error = null;
    data = null;

    constructor(initialValues) {
        Object.assign(this, initialValues)
    }
}


function isRatingUpdating(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actionTypes.RATING_UPDATE_PROGRESS:
            state = true;
            break;
        case actionTypes.RATING_UPDATE_COMPLETE:
            state = false;
            break;
        case actionTypes.RATING_UPDATE_ERROR:
            state = false;
            break;
    }

    return state;
}

function isPlaying(state = false, action = null) {

    switch (action.type) {
        case actionTypes.SONG_PLAY:
            state = true;
            break;
        case actionTypes.SONG_PAUSE:
            state = false;
            break;
    }

    return state;
}


function currentSongAsync(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actionTypes.SONG_LOAD_PROGRESS:
            state = new AsyncState({inProgress: true});
            break;
        case actionTypes.SONG_LOAD_COMPLETE:
        case actionTypes.SONG_UPDATED:
            state = new AsyncState({inProgress: false, data: action.songData});
            break;
        case actionTypes.SONG_LOAD_ERROR:
            state = new AsyncState({error: true});
            break;
    }

    return state;
}


function playlistsAsync(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actionTypes.PLAYLISTS_LOAD_PROGRESS:
            state = new AsyncState({inProgress: true});
            break;
        case actionTypes.PLAYLISTS_LOAD_COMPLETE:
            state = new AsyncState({data: action.playlists});
            break;
        case actionTypes.PLAYLISTS_LOAD_ERROR:
            state = new AsyncState({error: true});
            break;
    }

    return state;
}

const rootReducer = combineReducers({
    isRatingUpdating,
    isPlaying,
    currentSongAsync,
    playlistsAsync,

    router: routerStateReducer
});

export default rootReducer;
