import history from '../utils/history'
import storeContainer from './store_container'
import ajaxConstructor from './ajax'

// TODO - CREDS
const SERVER_ADDRESS = "***REMOVED***/239ca17c-b794-44e7-962e-dc31f57fca1f/api/";

// redirect to login page on any 401
let ajax = ajaxConstructor(SERVER_ADDRESS, function (response) {
    if (response.status == 401) {
        history.pushState(null, '/login');
    }

    return response;
});

export function playlistSongs(playlistName) {
    return ajax.get(`/playlists/${playlistName}`)
        .then(response => response.json().then(json => json))
        .then((json) => {
            return json.tracks;
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
    return ajax.post(`/song/${songId}/last-played`);


    //return new Promise((resolve, reject) => setTimeout(function () {
    //    resolve();
    //}, 500));
}

export function updateRating(songId, newRating) {
    return ajax.put(`/song/${songId}/rating`, {body: {newRating}});
}

export function authenticate(password) {
    return ajax.post("/access-token", {body: {password}});
}

