import { FETCH_NEXT_SONG_DETAILS_ASYNC } from './actions';
import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';


function nextSongAsync(state = {}, action = null) {
    switch (action.type) {
        case FETCH_NEXT_SONG_DETAILS_ASYNC:
            if(action.inProgress) return {inProgress: action.inProgress};
            if(action.ok) return {inProgress: action.inProgress, song: action.json.next };
            if(!action.ok) return {inProgress: action.inProgress, error: "Next song fetch failed" };
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    nextSongAsync: nextSongAsync,
    router: routerStateReducer
});

export default rootReducer;
