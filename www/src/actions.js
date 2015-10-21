import fetch from 'isomorphic-fetch'
import { soundManager } from 'soundmanager2';

export const FETCH_NEXT_SONG_DETAILS_ASYNC = 'FETCH_NEXT_SONG_DETAILS_ASYNC';

export const SOUND_LOADING = 'SOUND_LOADING';
export const SOUND_PLAY = 'SOUND_PLAY';
export const SOUND_PAUSE = 'SOUND_PAUSE';

const SERVER_ADDRESS = "http://localhost:5000";

soundManager.setup({
    url: require("file!../lib/swf/soundmanager2.swf"),
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false
});

export function fetchNextSongDetails(playlistName) {
    return function (dispatch) {
        dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, inProgress: true});

        let fullUrl = SERVER_ADDRESS + "/playlist/" + playlistName + "/next";
        return fetch(fullUrl)
            .then(response => response.json().then(json => ({json, response})))
            .then(({ json, response }) => {
                dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: response.ok, json})
            })
            .catch((ex) => {
                dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: false, json: {error: "Connection error"}})
            });
    }
}

function _loadSound(songId) {
    return new Promise(function(resolve, reject) {
        soundManager.createSound({
            id: songId, // optional: provide your own unique id
            url: 'http://localhost:5000/song/' + songId + "/stream",
            autoLoad: true,
            onload: function () {
                // DEBUG - Auto rewind to -10 seconds
                console.log('sound loaded! duration: ' + this.duration, this);
                this.setPosition(this.duration - 10000);

                resolve(this);
            }
        })
    })
}

export function playToggle(songId) {
    return function (dispatch) {
        return Promise.resolve(soundManager.getSoundById(songId))
            .then(function (sound) {
                if (sound && sound.loaded) {
                    return sound;
                } else {
                    dispatch({type: SOUND_LOADING, songId: songId})
                    return _loadSound(songId, dispatch)
                }
            })
            .then(function (sound) {
                if (!sound.loaded) {
                    throw new Error("Sound should be loadded at this point: " + sound.id)
                }

                if (sound.playState == 0 || sound.paused) {
                    sound.play();
                    dispatch({type: SOUND_PLAY, songId: songId})
                } else {
                    sound.pause();
                    dispatch({type: SOUND_PAUSE, songId: songId})
                }
            });
    }
}
