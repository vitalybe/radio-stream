import { soundManager } from 'soundmanager2';
import { pushState } from 'redux-router';
import ajaxConstructor from './ajax'
import { dispatchContainer } from './dispatch'

export const FETCH_NEXT_SONG_DETAILS_ASYNC = 'FETCH_NEXT_SONG_DETAILS_ASYNC';

export const SOUND_LOADING = 'SOUND_LOADING';
export const SOUND_PLAY = 'SOUND_PLAY';
export const SOUND_PAUSE = 'SOUND_PAUSE';
export const SOUND_FINISHED = 'SOUND_FINISHED';
export const SOUND_PLAY_ERROR = 'SOUND_PLAY_ERROR';

const SERVER_ADDRESS = window.location.protocol + "//" + window.location.hostname+":5000";
const MUSIC_ADDRESS = window.location.protocol + "//" + window.location.hostname+":16768";

soundManager.setup({
    url: require("file!../lib/swf/soundmanager2.swf"),
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    html5PollingInterval: 50
});

let ajax = ajaxConstructor(SERVER_ADDRESS, function (response) {
    if(response.status == 401) {
        dispatchContainer.dispatch(pushState(null, '/login'))
    }

    return response;
});

function _loadSound(dispatch, song) {
    // TODO: Handle failures
    let songId = song.id;

    return new Promise(function (resolve, reject) {
        soundManager.createSound({
            id: songId, // optional: provide your own unique id
            url: MUSIC_ADDRESS + "/" + song.location,
            autoLoad: true,
            // Every song that was loaded, should have the following events
            // NOTE: This is a bit of a leaky abstraciton. It is tricky to decouple onfinish from this function since
            // events can be subscribed to only on creation or during play.
            onload: function () {

                if (this.duration == 0) {
                    reject(new Error(`Song ${songId} duration after load was 0`))
                }

                this.onPosition(this.duration - 1000, () => {
                    console.log(`SUCCESS song ${songId}: almost finished. marking as played`);
                    _markSongAsPlayed(songId, dispatch)
                });

                console.log(`SUCCESS song ${songId}: loaded`);
                resolve(this);

            },
            onfinish: function () {
                console.log(`SUCCESS song ${songId}: finished`);
                dispatch({type: SOUND_FINISHED, songId: songId})
            }
        })
    })
}

function _fetchNextSongDetails(playlistName, dispatch) {
    dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, inProgress: true});

    return ajax.get(`/playlist/${playlistName}/next`)
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json, response }) => {
            dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: response.ok, json})
            return json.next;
        })
        .catch((ex) => {
            dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: false, json: {error: "Connection error"}})
        });
}

function _markSongAsPlayed(songId, dispatch) {
    console.log(`IN PROGESS song ${songId}: mark as played`);
    return ajax.post(`/song/${songId}/last-played`)
        .then(response => {
            console.log(`SUCCESS song ${songId}: mark as played`)
        })
        .catch((ex) => {
            console.log(`ERROR song ${songId}: mark as played: ${ex}`);
        });
}

// Tries to get the sound from SoundManager, if fails, tries to load it
function _getOrLoadSound(dispatch, song) {
    // TODO: Handle failures
    let songId = song.id;

    return Promise.resolve(soundManager.getSoundById(songId))
        .then(function (sound) {
            if (sound && sound.loaded) {
                return sound;
            } else {
                dispatch({type: SOUND_LOADING, songId: songId});
                return _loadSound(dispatch, song);
            }
        });
}

function _playToggle(dispatch, song, playOptions) {
    let songId = song.id;

    return _getOrLoadSound(dispatch, song)
        .then(function (sound) {
            if (!sound.loaded) {
                throw new Error("Sound should be loadded at this point: " + sound.id)
            }

            if (sound.playState == 0 || sound.paused) {
                sound.play(playOptions);
                dispatch({type: SOUND_PLAY, songId: songId})
            } else {
                sound.pause();
                dispatch({type: SOUND_PAUSE, songId: songId})
            }
        })
        .catch(function(err) {
            dispatch({type: SOUND_PLAY_ERROR, songId: songId})

            throw err;
        });
}

function _playPlaylist(dispatch, playlistName) {
    _fetchNextSongDetails(playlistName, dispatch)
        .then(function (nextSong) {
            return _playToggle(dispatch, nextSong, {
                onfinish: () => {
                    _playPlaylist(dispatch, playlistName);
                }
            }).catch(function (err) {
                console.log(`ERROR failed to play song ${nextSong.id}: Will mark it as read and proceed to next one`);
                _markSongAsPlayed(nextSong.id, dispatch).then(function() {
                    console.log(`Marked as read - Continue to play playlist: ${playlistName}`);
                    _playPlaylist(dispatch, playlistName);
                });
            });

        })
}

export function playToggle(song, playOptions) {
    return function (dispatch) {
        _playToggle(dispatch, song, playOptions).catch(function(err) {
            console.error(`ERROR - Failed to play sound: ${err}`);
        });
    }
}

export function fastForward(songId) {
    console.log('fastForward');
    let sound = soundManager.getSoundById(songId);
    sound.setPosition(sound.duration - 10000);

    return {type: "N/A"};
}

export function playPlaylist(playlistName) {
    return function (dispatch) {
        _playPlaylist(dispatch, playlistName);
    }
}

export function fetchNextSongDetails(playlistName) {
    return function (dispatch) {
        _fetchNextSongDetails(playlistName, dispatch);
    }
}

export function login(password) {

    return ajax.post("/access-token", {body: {password}}).
        then(response => response.json().then(json => json))

};
