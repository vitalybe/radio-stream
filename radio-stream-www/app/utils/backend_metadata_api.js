import getHistory from '../utils/history'
import ajaxConstructor from './ajax'

import settings from '../utils/settings'

function getAjax() {

    var beetsServer = `http://${settings.host}/api`;

    return ajaxConstructor(beetsServer, function (response) {
        if (response.status == 401) {
            getHistory().pushState(null, '/login');
        }

        return response;
    });
}

export function playlistSongs(playlistName) {

    return getAjax().get(`/playlists/${playlistName}`)
        .then(response => response.json().then(json => json))
        .then((json) => {
            return json.results;
        });
}

export function playlists() {

    return getAjax().get(`/playlists`)
        .then(response => response.json().then(json => json))
        .then((json) => {
            return json.playlists;
        });
}

export function updateLastPlayed(songId) {
    return getAjax().post(`/item/${songId}/last-played`);
}

export function updateRating(songId, newRating) {
    return getAjax().put(`/item/${songId}/rating`, {body: {newRating}});
}