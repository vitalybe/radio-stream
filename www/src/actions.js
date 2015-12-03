import { soundManager } from 'soundmanager2';
import { pushState } from 'redux-router';
import { dispatchContainer } from './utils/dispatch'
import { getSoundBySong, loadSound } from './utils/wrapped_sound_manager'
import rootLogger from './utils/logger'
import * as backendMetadataApi from './utils/backend_metadata_api'

const logger = rootLogger.prefix("actions");

export const SONG_LOAD_PROGRESS = 'SONG_LOAD_PROGRESS';
export const SONG_LOAD_COMPLETE = 'SONG_LOAD_COMPLETE';

export const SONG_PLAY = 'SONG_PLAY';
export const SONG_PAUSE = 'SONG_PAUSE';

function _fetchNextSongDetails(playlistName) {
    return backendMetadataApi.nextSongInPlaylist(playlistName)
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json, response }) => {
            return json.next;
        });
}

function _markSongAsPlayed(songId) {
    logger.info(`IN PROGESS song ${songId}: mark as played`);
    return backendMetadataApi.updateLastPlayed(songId)
        .then(() => {
            logger.info(`SUCCESS song ${songId}: mark as played`)
        })
        .catch((ex) => {
            logger.info(`ERROR song ${songId}: mark as played: ${ex}`);
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
                return loadSound(song);
            }
        });
}

// resolves to the played/paused sound on success
function _playToggle(wrappedSound, playOptions) {

    if (!wrappedSound.loaded) {
        throw new Error("Sound should be loaded at this point: " + wrappedSound.song.id)
    }

    if (wrappedSound.playState == 0 || wrappedSound.paused) {
        wrappedSound.play(playOptions);
        dispatchContainer.dispatch({type: SONG_PLAY});

        logger.info(`play: ${wrappedSound.song.id}`);
    } else {
        wrappedSound.pause();
        dispatchContainer.dispatch({type: SONG_PAUSE});

        logger.info(`pause: ${wrappedSound.song.id}`);
    }

    return wrappedSound.song.id;

}

// Marks given song as complete and preloads the next song
function handleAlmostDoneSong(almostDoneSongId, playlistName) {
    logger.info(`song ${almostDoneSongId}: almost finished. marking as played and preloading next song`);
    return _markSongAsPlayed(almostDoneSongId)
        .then(function () {
            return _fetchNextSongDetails(playlistName)
        }).then(function (preloadedSong) {
            logger.info(`next song is ${preloadedSong.id}. Preloading...`);
            return _getOrLoadSound(preloadedSong);
        }).then(function (preloadedSound) {
            logger.info(`preloaded sound for song: ${preloadedSound.song.id}`);
        })
}

function _playPlaylist(playlistName) {
    dispatchContainer.dispatch({type: SONG_LOAD_PROGRESS});

    let nextSong = null;
    _fetchNextSongDetails(playlistName)
        .then(function (nextSongArg) {
            nextSong = nextSongArg;
            return _getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {

            dispatchContainer.dispatch({type: SONG_LOAD_COMPLETE, songData: wrappedSound.song});

            return _playToggle(wrappedSound, {
                on75PercentPlayed: () => {
                    handleAlmostDoneSong(playlistName, wrappedSound.song.id);
                },
                onfinish: () => {
                    logger.info(`song finished: ${wrappedSound.song.id}. starting playlist: ${playlistName}`);
                    _playPlaylist(playlistName);
                }
            })
        }).catch(function (err) {
            logger.error(`failed to play song ${nextSong.id}: Will mark it as read and proceed to next one. Error: ${err}`);
            _markSongAsPlayed(nextSong.id).then(function () {
                logger.info(`marked as read - Continue to play playlist: ${playlistName}`);
                _playPlaylist(playlistName);
            });
        })
}

export function fastForward(songId) {
    logger.info('fastForward');
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

    return backendMetadataApi.authenticate(password).
        then(response => response.json().then(json => json))

}
