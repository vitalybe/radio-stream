import Freezer from 'freezer-js';
import * as actions from './actions';
import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';


function nextSongAsync(state = {}, action = null) {
    switch (action.type) {
        case actions.FETCH_NEXT_SONG_DETAILS_ASYNC:
            if(action.inProgress) return {inProgress: action.inProgress};
            if(action.ok) return {inProgress: action.inProgress, song: action.json.next };
            if(!action.ok) return {inProgress: action.inProgress, error: "Next song fetch failed" };
        default:
            return state;
    }
}

let currentSongData = new Freezer({id: null, loading: false, playing: false});
function currentSong(state = currentSongData.get(), action = null) {

    switch (action.type) {
        case actions.SOUND_LOADING:
            state.set({loading: true, playing: false, id: action.songId});
            break;
        case actions.SOUND_PLAY:
            state.set({loading: false, playing: true, id: action.songId});
            break;
        case actions.SOUND_PLAY_ERROR:
            state.set({loading: false, playing: false, id: action.songId});
            break;
        case actions.SOUND_PAUSE:
            state.set({loading: false, playing: false, id: action.songId});
            break;
        case actions.SOUND_FINISHED:
            state.set({loading: false, playing: false, id: action.songId});
            break;
    }

    return currentSongData.get();
}

const rootReducer = combineReducers({
    nextSongAsync,
    currentSong,
    router: routerStateReducer
});

export default rootReducer;
