import loggerCreator from './utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import * as actionTypes from './actions/action_types';
import { combineReducers } from 'redux';

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

function isMarkedAsPlayed(state = false, action = null) {

    switch (action.type) {
        case actionTypes.SONG_MARKED_AS_PLAYED:
            state = true;
            break;
        case actionTypes.SONG_LOAD_COMPLETE:
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
        title: songJson.title,
        album: songJson.album,
        itunes_rating: songJson.itunes_rating,
        itunes_playcount: songJson.itunes_playcount,
        itunes_lastplayed: songJson.itunes_lastplayed,
        path: songJson.path
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
            return _.merge({}, state, {data: {itunes_rating: action.newRating}});
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
        case actionTypes.PLAYLIST_SONGS_CLEAR:
            state = [];
            break;
    }

    return state;
}

function currentPlaylistIndex(state = -1, action = null) {
    switch (action.type) {
        case actionTypes.PLAYLIST_SONGS_CLEAR:
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
        case actionTypes.PLAYLIST_SONGS_CLEAR:
            state = null;
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

function currentArtistImage(state = null, action = null) {
    let logger = loggerCreator(currentArtistImage.name, moduleLogger);

    switch (action.type) {
        // Reset image when song changes
        case actionTypes.SONG_LOAD_PROGRESS:
            state = null;
            break;
        case actionTypes.ARTIST_LOAD_COMPLETE:
            try {
                state = action.value.image[3]["#text"];
            } catch (e) {
                logger.warn("failed to get artist image from: ", action)
                state = null;
            }
            break;
    }

    return state;
}


const rootReducer = combineReducers({
    isRatingUpdating,
    isPlaying,
    isMarkedAsPlayed,
    currentSongAsync,
    currentPlaylist,
    currentArtistImage,
    playlistsAsync
});

export default rootReducer;
