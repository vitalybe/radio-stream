import Freezer from 'freezer-js';
import * as actionTypes from './actions/action_types';
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

// Extracts from backend API json song data
function extractSongDataFromJson(songJson) {
    return {
        id: songJson.id,
        artist: songJson.artist,
        name: songJson.name,
        rating: songJson.rating,
        playCount: songJson.play_count,
        location: songJson.location
    }
}

function currentSongAsync(state = new AsyncState(), action = null) {

    switch (action.type) {
        case actionTypes.SONG_LOAD_PROGRESS:
            state = new AsyncState({inProgress: true});
            break;
        case actionTypes.SONG_LOAD_COMPLETE:
            state = new AsyncState({inProgress: false, data: extractSongDataFromJson(action.songData)});
            break;
        case actionTypes.RATING_UPDATE_COMPLETE:
            return _.merge({}, state, {data: {rating: action.newRating}});
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
            state = new AsyncState({inProgress: false, data: action.playlists});
            break;
        case actionTypes.PLAYLISTS_LOAD_ERROR:
            state = new AsyncState({error: true});
            break;
    }

    return state;
}

function currentPlaylistSongs(state = [], action = null) {
    switch (action.type) {
        case actionTypes.PLAYLIST_SONGS_UPDATED:
            state = action.playlistSongs.map(extractSongDataFromJson);
            break;
    }

    return state;
}

function currentPlaylistIndex(state = -1, action = null) {
    switch (action.type) {
        case actionTypes.PLAYLIST_SONGS_UPDATED:
            state = -1; // Index is restarted on a new playlist
            break;
        case actionTypes.PLAYLIST_INDEX_INC:
            state += 1;
            break;
    }

    return state;
}

function currentPlaylistName(state = null, action = null) {
    switch (action.type) {
        case actionTypes.PLAYLIST_SONGS_UPDATED:
            state = action.playlistName;
            break;
    }

    return state;
}

// Updates the pagination data for different actions.
const currentPlaylist = combineReducers({
    name: currentPlaylistName,
    songs: currentPlaylistSongs,
    index: currentPlaylistIndex
});


const rootReducer = combineReducers({
    isRatingUpdating,
    isPlaying,
    currentSongAsync,
    currentPlaylist,
    playlistsAsync,

    router: routerStateReducer
});

export default rootReducer;
