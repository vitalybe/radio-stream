import history from '../utils/history'
import storeContainer from './store_container'
import ajaxConstructor from './ajax'

import { BEETS_SERVER } from './config'

// redirect to login page on any 401
let ajax = ajaxConstructor(BEETS_SERVER, function (response) {
    if (response.status == 401) {
        history.pushState(null, '/login');
    }

    return response;
});

export function playlistSongs(playlistName) {
    return ajax.get(`/playlists/${playlistName}`)
        .then(response => response.json().then(json => json))
        .then((json) => {
            return json.results;
        });
}

export function playlists() {
    return ajax.get(`/playlists`)
        .then(response => response.json().then(json => json))
        .then((json) => {
            return json.playlists;
        });
}


export function updateLastPlayed(songId) {
    return ajax.post(`/item/${songId}/last-played`);
}

export function updateRating(songId, newRating) {
    return ajax.put(`/item/${songId}/rating`, {body: {newRating}});
}

export function authenticate(password) {
    return ajax.post("/access-token", {body: {password}});
}

