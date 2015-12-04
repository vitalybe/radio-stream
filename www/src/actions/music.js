import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator.prefixFile(__filename);

import { dispatchContainer } from '../utils/dispatch'
import { getSoundBySong, loadSound } from '../utils/wrapped_sound_manager'
import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as actionTypes from './types'

function fetchNextSongDetails(playlistName) {
    logger.info(`fetchNextSongDetails for ${playlistName} in progress`);
    return backendMetadataApi.nextSongInPlaylist(playlistName)
        .then(response => response.json().then(json => ({json, response})))
        .then(({ json }) => {
            logger.info(`fetchNextSongDetails for ${playlistName} complete`);
            return json.next;
        });
}

function markSongAsPlayed(songId) {
    logger.info(`markSongAsPlayed: ${songId} in progress`);
    return backendMetadataApi.updateLastPlayed(songId)
        .then(() => {
            logger.info(`markSongAsPlayed: ${songId} complete`);
        });
}

// Tries to get the sound from SoundManager, if fails, tries to load it
function getOrLoadSound(song) {
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
function playToggle(wrappedSound, playOptions) {

    if (!wrappedSound.loaded) {
        throw new Error("Sound should be loaded at this point: " + wrappedSound.song.id)
    }

    if (wrappedSound.playState == 0 || wrappedSound.paused) {
        wrappedSound.play(playOptions);
        dispatchContainer.dispatch({type: actionTypes.SONG_PLAY});

        logger.info(`play: ${wrappedSound.song.id}`);
    } else {
        wrappedSound.pause();
        dispatchContainer.dispatch({type: actionTypes.SONG_PAUSE});

        logger.info(`pause: ${wrappedSound.song.id}`);
    }

    return wrappedSound;
}

// Marks given song as complete and preloads the next song
function handleAlmostDoneSong(almostDoneSongId, playlistName) {
    logger.info(`song ${almostDoneSongId}: almost finished. marking as played and preloading next song`);
    return markSongAsPlayed(almostDoneSongId)
        .then(function () {
            return fetchNextSongDetails(playlistName)
        }).then(function (preloadedSong) {
            logger.info(`next song is ${preloadedSong.id}. Preloading...`);
            return getOrLoadSound(preloadedSong);
        }).then(function (preloadedSound) {
            logger.info(`preloaded sound for song: ${preloadedSound.song.id}`);
        })
}

// stores the playlist and sound of the currently playing/paused song
let currentSongInPlaylist = {
    playlistName: null,
    wrappedSound: null
};

// finds the next song in the playlist and loads it
function loadNextSongInPlaylist(playlistName) {
    dispatchContainer.dispatch({type: actionTypes.SONG_LOAD_PROGRESS});

    let nextSong = null;
    return fetchNextSongDetails(playlistName)
        .then(function (nextSongArg) {
            nextSong = nextSongArg;
            return getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {

            currentSongInPlaylist.playlistName = playlistName;
            currentSongInPlaylist.wrappedSound = wrappedSound;

            dispatchContainer.dispatch({type: actionTypes.SONG_LOAD_COMPLETE, songData: wrappedSound.song});

            return wrappedSound;
        }).catch(function (err) {
            logger.error(`failed to play song ${nextSong.id}: Will mark it as read and proceed to next one. Error: ${err}`);
            markSongAsPlayed(nextSong.id).then(function () {
                logger.info(`marked as read - Continue to play playlist: ${playlistName}`);
                return loadNextSongInPlaylist(playlistName);
            });
        })
}

// plays/pauses the given sound in a playlist mode:
// * handleAlmostDoneSong on 75%
// * start next song on finish
function playTogglePlaylist(playlistName) {

    // If there a song is already playing, just play/pause it.
    // When song finishes, it will load next song in playlist.
    if (currentSongInPlaylist.playlistName == playlistName && currentSongInPlaylist.wrappedSound) {

        let wrappedSound = currentSongInPlaylist.wrappedSound;

        return playToggle(wrappedSound, {
            on75PercentPlayed: () => {
                handleAlmostDoneSong(playlistName, wrappedSound.song.id);
            },
            onfinish: () => {
                logger.info(`song finished: ${wrappedSound.song.id}. starting playlist: ${playlistName}`);
                loadNextSongInPlaylist(playlistName).then(() => playTogglePlaylist(playlistName));
            }
        })
    } else {
        // No song of this playlist is currently playing/paused. Load the next song in playlist and play it.
        loadNextSongInPlaylist(playlistName).then(wrappedSound => {
            playTogglePlaylist(playlistName, wrappedSound);
        });
    }
}

export function playTogglePlaylistAction(playlistName) {
    return function () {
        return playTogglePlaylist(playlistName);
    }
}
