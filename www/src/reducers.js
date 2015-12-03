import Freezer from 'freezer-js';
import * as actions from './actions';
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
        case actions.RATING_UPDATE_PROGRESS:
            state = true;
            break;
        case actions.RATING_UPDATE_COMPLETE:
            state = false;
            break;
        case actions.RATING_UPDATE_ERROR:
            state = false;
            break;
    }

    return state;
}

function isPlaying(state = false, action = null) {

    switch (action.type) {
        case actions.SONG_PLAY:
            state = true;
            break;
        case actions.SONG_PAUSE:
            state = false;
            break;
    }

    return state;
}


function currentSongAsync(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actions.SONG_LOAD_PROGRESS:
            state = new AsyncState({inProgress: true});
            break;
        case actions.SONG_LOAD_COMPLETE:
        case actions.SONG_UPDATED:
            state = new AsyncState({inProgress: false, data: action.songData});
            break;
        case actions.SONG_LOAD_ERROR:
            state = new AsyncState({error: true});
            break;
    }

    return state;
}


function playlistsAsync(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actions.PLAYLISTS_LOAD_PROGRESS:
            state = new AsyncState({inProgress: true});
            break;
        case actions.PLAYLISTS_LOAD_COMPLETE:
            state = new AsyncState({data: action.playlists});
            break;
        case actions.PLAYLISTS_LOAD_ERROR:
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
