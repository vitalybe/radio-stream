import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

import storeContainer from '../utils/store_container'
import { getSoundBySong, loadSound } from '../utils/wrapped_sound_manager'
import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as actionTypes from './action_types'

function getNextSongInPlaylist(playlistName, currentPlaylist) {
    logger.info(`[getNextSongInPlaylist] Getting next song in ${playlistName}`);

    logger.debug(`Current playlist: ${currentPlaylist.name}. In it ${currentPlaylist.songs.length} songs. Current index: ${currentPlaylist.index}.`);

    let playlistSongsPromise = null;
    let nextSongIndex = null;
    // if next song goes beyond the maximum index
    if (playlistName != currentPlaylist.name || currentPlaylist.index >= currentPlaylist.songs.length - 1) {
        logger.debug("Re-fetching songs in playlist.");
        playlistSongsPromise = backendMetadataApi.playlistSongs(playlistName).then(playlistSongs => {
            storeContainer.store.dispatch({type: actionTypes.PLAYLIST_SONGS_UPDATED, playlistSongs, playlistName});
            // The reduced version translates the JSON to internal interface
            return storeContainer.store.getState().currentPlaylist.songs;
        });
        nextSongIndex = 0;
    } else {
        logger.debug("using existing playlist tracks");
        playlistSongsPromise = Promise.resolve(currentPlaylist.songs);
        nextSongIndex = currentPlaylist.index + 1;
    }

    return playlistSongsPromise.then(playlistSongs => {
        return playlistSongs[nextSongIndex];
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
function playToggle(song, playOptions) {

    return getOrLoadSound(song).then(wrappedSound => {
        if (!wrappedSound.loaded) {
            throw new Error("Sound should be loaded at this point: " + wrappedSound.song.id)
        }

        if (wrappedSound.playState == 0 || wrappedSound.paused) {
            wrappedSound.play(playOptions);
            storeContainer.store.dispatch({type: actionTypes.SONG_PLAY});

            logger.info(`play: ${song.id}`);
        } else {
            wrappedSound.pause();
            storeContainer.store.dispatch({type: actionTypes.SONG_PAUSE});

            logger.info(`pause: ${song.id}`);
        }

        return song;
    });
}

// finds the next song in the playlist and loads it
function playNextSongInPlaylist(playlistName) {
    storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_PROGRESS});

    let nextSong = null;
    return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist)
        .then(function (nextSongArg) {
            nextSong = nextSongArg;
            return getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {
            storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_COMPLETE, songData: nextSong});
            storeContainer.store.dispatch({type: actionTypes.PLAYLIST_INDEX_INC});
        })
        .then(() => playTogglePlaylist(playlistName, nextSong)
            .then(()=> {
                return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist);
            })
            .then((song) => getOrLoadSound(song))
            // NOTE: It is important to catch preload errors here, otherwise, the error would trigger a `playNextSongInPlaylist`
            .catch(err => {
                logger.error(`preload failed. would not try to preload anything else: ${err}`);
            }))
        .catch(function (err) {
            logger.error(`failed to load song ${nextSong.id}: Will mark it as read and proceed to next one. Error: ${err}`);
            markSongAsPlayed(nextSong.id)
                .then(function () {
                    logger.info(`marked as read - Continue to play playlist: ${playlistName}`);
                    storeContainer.store.dispatch({type: actionTypes.PLAYLIST_INDEX_INC});
                    return playNextSongInPlaylist(playlistName);
                });
        })
}

// plays/pauses the given sound in a playlist mode:
// * start next song on finish
function playTogglePlaylist(playlistName, song) {
    return playToggle(song, {
        onfinish: () => {
            logger.info(`song finished: ${song.id}. starting playlist: ${playlistName}`);
            markSongAsPlayed(song.id)
                .then(() => playNextSongInPlaylist(playlistName));
        }
    })
}

export function startPlayingPlaylistAction(playlistName) {
    return function () {
        return playNextSongInPlaylist(playlistName);
    }
}

export function playTogglePlaylistAction(playlistName, song) {
    return function () {
        return playTogglePlaylist(playlistName, song);
    }
}

export function playNextSongAction(playlistName, currentSong) {
    return function () {
        getOrLoadSound(currentSong)
            .then(function(sound) {
                sound.stop();

                return markSongAsPlayed(currentSong.id);
            })
            .then(function () {
                logger.info(`marked as read - Continue to play playlist: ${playlistName}`);
                return playNextSongInPlaylist(playlistName);
            });
    }
}