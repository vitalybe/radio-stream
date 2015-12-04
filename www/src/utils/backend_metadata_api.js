import { pushState } from 'redux-router';
import { dispatchContainer } from '../utils/dispatch'
import ajaxConstructor from './ajax'


const SERVER_ADDRESS = window.location.protocol + "//" + window.location.hostname + ":5000";

// redirect to login page on any 401
let ajax = ajaxConstructor(SERVER_ADDRESS, function (response) {
    if (response.status == 401) {
        dispatchContainer.dispatch(pushState(null, '/login'))
    }

    return response;
});

export function nextSongInPlaylist(playlistName) {
    return ajax.get(`/playlist/${playlistName}/next`);
}

export function updateLastPlayed(songId) {
    ajax.post(`/song/${songId}/last-played`)
}

export function authenticate(password) {
    return ajax.post("/access-token", {body: {password}});
}