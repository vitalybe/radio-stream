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

function _fetchNextSongDetails(playlistName, dispatch) {
    dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, inProgress: true});

    let fullUrl = SERVER_ADDRESS + "/playlist/" + playlistName + "/next";
    return fetch(fullUrl)
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json, response }) => {
            dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: response.ok, json})
            return json.next;
        })
        .catch((ex) => {
            dispatch({type: FETCH_NEXT_SONG_DETAILS_ASYNC, ok: false, json: {error: "Connection error"}})
        });
}

// TODO: Remove this function
export function fetchNextSongDetails(playlistName) {
    return function (dispatch) {
        _fetchNextSongDetails(playlistName, dispatch);
    }
}

function _markSongAsPlayed(songId, dispatch) {
    let fullUrl = SERVER_ADDRESS + `/song/${songId}/last-played`;
    console.log(`IN PRROGESS song ${songId}: mark as played`);
    return fetch(fullUrl, {method: "POST"})
        .then(response => {
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

export function fastForward(songId) {
    console.log('fastForward');
    let sound = soundManager.getSoundById(songId);
    sound.setPosition(sound.duration - 10000);

    return {type: "N/A"};
}

function _getSoundForSong(dispatch, song) {
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

    return _getSoundForSong(dispatch, song)
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
        });
}

export function playToggle(song, playOptions) {
    return function (dispatch) {
        _playToggle(dispatch, song, playOptions);
    }
}

function _playPlaylist(dispatch, playlistName) {
    _fetchNextSongDetails(playlistName, dispatch)
        .then(function (nextSong) {
            return _playToggle(dispatch, nextSong, {
                onfinish: () => {
                    _playPlaylist(dispatch, playlistName);
                }
            }).catch(function (err) {
                console.log(`ERROR failed to play song ${nextSong.id}: Will mark it as read and proceed to next oen`);
                _markSongAsPlayed(nextSong.id, dispatch).then(function() {
                    console.log(`Marked as read - Continue to play playlist: ${playlistName}`);
                    _playPlaylist(dispatch, playlistName);
                });
            });

        })
}

export function playPlaylist(playlistName) {
    return function (dispatch) {
        _playPlaylist(dispatch, playlistName);
    }
}