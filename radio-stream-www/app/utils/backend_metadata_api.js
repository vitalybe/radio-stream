import getHistory from '../utils/history'
import Ajax from './ajax'
import * as config from "../utils/config"


import getSettings from '../stores/settings'

// NOTE: Since the host might change, we create a new Ajax object every time
function getAjax(customSettings) {

    let settings = getSettings();
    if (customSettings) {
        settings = customSettings;
    }

    var beetsServer = `http://${settings.values.host}/api`;

    var credentials = btoa(unescape(encodeURIComponent(config.USERNAME + ':' + settings.values.password)))
    return new Ajax(beetsServer, {
        'headers': {
            'Authorization': "Basic " + credentials
        }
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

export function testConnection(customSettings) {
    return getAjax(customSettings).get(`/playlists`);
}