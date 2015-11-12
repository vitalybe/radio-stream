import { soundManager } from 'soundmanager2';
import { pushState } from 'redux-router';
import ajaxConstructor from './ajax'
import { dispatchContainer } from './dispatch'
import { getSoundBySong, loadSound, WrappedSound } from './wrapped_sound_manager'

export const FETCH_NEXT_SONG_DETAILS_ASYNC = 'FETCH_NEXT_SONG_DETAILS_ASYNC';

export const SOUND_LOADING = 'SOUND_LOADING';
export const SOUND_PLAY = 'SOUND_PLAY';
export const SOUND_PAUSE = 'SOUND_PAUSE';
export const SOUND_FINISHED = 'SOUND_FINISHED';
export const SOUND_PLAY_ERROR = 'SOUND_PLAY_ERROR';

const SERVER_ADDRESS = window.location.protocol + "//" + window.location.hostname + ":5000";

soundManager.setup({
    url: require("file!../lib/swf/soundmanager2.swf"),
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    html5PollingInterval: 50
});

// redirect to login page on any 401
let ajax = ajaxConstructor(SERVER_ADDRESS, function (response) {
    if (response.status == 401) {
        dispatchContainer.dispatch(pushState(null, '/login'))
    }

    return response;
});


function _fetchNextSongDetails(playlistName) {
    dispatchContainer.dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, inProgress: true});

    return ajax.get(`/playlist/${playlistName}/next`)
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json, response }) => {
            dispatchContainer.dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: response.ok, json});
            return json.next;
        })
        .catch(() => {
            dispatchContainer.dispatch({
                type: FETCH_NEXT_SONG_DETAILS_ASYNC,
                ok: false,
                json: {error: "Connection error"}
            })
        });
}

function _markSongAsPlayed(songId) {
    console.log(`IN PROGESS song ${songId}: mark as played`);
    return ajax.post(`/song/${songId}/last-played`)
        .then(() => {
            console.log(`SUCCESS song ${songId}: mark as played`)
        })
        .catch((ex) => {
            console.log(`ERROR song ${songId}: mark as played: ${ex}`);
        });
}

// Tries to get the sound from SoundManager, if fails, tries to load it
function _getOrLoadSound(song) {
    // TODO: Handle failures
    return Promise.resolve(getSoundBySong(song))
        .then(function (sound) {
            if (sound && sound.loaded) {
                return sound;
            } else {
                dispatchContainer.dispatch({type: SOUND_LOADING, songId: song.id});
                return loadSound(song);
            }
        });
}

// resolves to the played/paused sound on success
function _playToggle(wrappedSound, playOptions) {

    try {
        if (!wrappedSound.loaded) {
            throw new Error("Sound should be loaded at this point: " + wrappedSound.song.id)
        }

        if (wrappedSound.playState == 0 || wrappedSound.paused) {
            wrappedSound.play(playOptions);
            dispatchContainer.dispatch({type: SOUND_PLAY, songId: wrappedSound.song.id})
        } else {
            wrappedSound.pause();
            dispatchContainer.dispatch({type: SOUND_PAUSE, songId: wrappedSound.song.id})
        }

        return wrappedSound.song.id;
    }
    catch (err) {
        dispatchContainer.dispatch({type: SOUND_PLAY_ERROR, songId: wrappedSound.song.id});

        throw err;
    }
}

function _playPlaylist(playlistName) {
    _fetchNextSongDetails(playlistName)
        .then(function (nextSong) {
            return _getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {
            return _playToggle(wrappedSound, {
                onPosition: {
                    position: wrappedSound.duration - 5000,
                    callback: () => {
                        console.log(`SUCCESS song ${wrappedSound.song.id}: almost finished. marking as played and preloading next song`);
                        return _markSongAsPlayed(wrappedSound.song.id)
                            .then(function () {
                                return _fetchNextSongDetails(playlistName)
                            }).then(function (preloadedSong) {
                                console.log(`next song is ${preloadedSong.id}. Preloading...`);
                                return _getOrLoadSound(preloadedSong);
                            }).then(function (preloadedSound) {
                                console.log(`preloaded sound for song: ${preloadedSound.song.id}`);
                            })
                    }
                },
                onfinish: () => {
                    console.log(`song finished: ${wrappedSound.song.id}. starting playlist: ${playlistName}`);
                    _playPlaylist(playlistName);
                }
            })
        }).catch(function () {
        console.log(`ERROR failed to play song ${wrappedSound.song.id}: Will mark it as read and proceed to next one`);
        _markSongAsPlayed(wrappedSound.song.id).then(function () {
            console.log(`Marked as read - Continue to play playlist: ${playlistName}`);
            _playPlaylist(playlistName);
        });
    })
}

export function playToggle(song, playOptions) {
    return function () {
        _getOrLoadSound(song).then(function (wrappedSound) {
            _playToggle(wrappedSound, playOptions);
        }).catch(function (err) {
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
    return function () {
        _playPlaylist(playlistName);
    }
}

export function fetchNextSongDetails(playlistName) {
    return function () {
        _fetchNextSongDetails(playlistName);
    }
}

export function login(password) {

    return ajax.post("/access-token", {body: {password}}).
    then(response => response.json().then(json => json))

}
