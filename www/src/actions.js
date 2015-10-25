import fetch from 'isomorphic-fetch'
import { soundManager } from 'soundmanager2';

export const FETCH_NEXT_SONG_DETAILS_ASYNC = 'FETCH_NEXT_SONG_DETAILS_ASYNC';

export const SOUND_LOADING = 'SOUND_LOADING';
export const SOUND_PLAY = 'SOUND_PLAY';
export const SOUND_PAUSE = 'SOUND_PAUSE';
export const SOUND_FINISHED = 'SOUND_FINISHED';


const SERVER_ADDRESS = "http://localhost:5000";
const MUSIC_ADDRESS = "http://localhost:16768";

soundManager.setup({
    url: require("file!../lib/swf/soundmanager2.swf"),
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    html5PollingInterval: 50
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

function _markSongAsPlayed(songId, dispatch) {
    let fullUrl = SERVER_ADDRESS + `/song/${songId}/last-played`;
    console.log(`IN PRROGESS song ${songId}: mark as played`)
    return fetch(fullUrl, {method: "POST"})
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json, response }) => {
            console.log(`SUCCESS song ${songId}: mark as played`)
        })
        .catch((ex) => {
            console.log(`ERROR song ${songId}: mark as played: ${ex}`);
        });
}

function _loadSound(dispatch, song) {
    // TODO: Handle failures
    let songId = song.id;

    return new Promise(function (resolve, reject) {
        soundManager.createSound({
            id: songId, // optional: provide your own unique id
            url: MUSIC_ADDRESS + "/" + song.location,
            autoLoad: true,
            onload: function () {
                // DEBUG - Auto rewind to -10 seconds
                console.log('sound loaded! duration: ' + this.duration, this);
                this.onPosition(this.duration - 1000, () => {
                    _markSongAsPlayed(songId, dispatch)
                });

                resolve(this);

            },
            onfinish: function () {
                dispatch({type: SOUND_FINISHED, songId: songId})
            }
        })
    })
}

export function fastForward(songId) {
    console.log('fastForward');
    let sound = soundManager.getSoundById(songId)
    sound.setPosition(sound.duration - 10000);

    return  {type: "N/A"};
}

export function playToggle(song) {
    let songId = song.id;
    return function (dispatch) {
        return Promise.resolve(soundManager.getSoundById(songId))
            .then(function (sound) {
                if (sound && sound.loaded) {
                    return sound;
                } else {
                    dispatch({type: SOUND_LOADING, songId: songId});
                    return _loadSound(dispatch, song);
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

