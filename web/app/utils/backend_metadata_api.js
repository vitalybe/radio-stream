import getHistory from '../utils/history'
import Ajax from './ajax'
import { USERNAME } from "../utils/constants"
import { getSettings } from '../stores/settings'

// NOTE: Since the host might change, we create a new Ajax object every time
function getAjax(customSettings) {

    let settings = getSettings();
    if (customSettings) {
        settings = customSettings;
    }

    var beetsServer = settings.address + "/api";
    var credentials = btoa(unescape(encodeURIComponent(USERNAME + ':' + settings.password)))
    return new Ajax(beetsServer, {
        'headers': {
            'Authorization': "Basic " + credentials,
            'Content-Type': "application/json"
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