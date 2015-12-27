import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

import storeContainer from '../utils/store_container'
import { getSoundBySong, loadSound, stopAll } from '../utils/wrapped_sound_manager'
import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as actionTypes from './action_types'
import { formatSong } from '../utils/util'

function getNextSongInPlaylist(playlistName, currentPlaylist) {
    let flogger = loggerCreator(getNextSongInPlaylist.name, logger);

    flogger.debug(`Getting next song in ${playlistName}`);
    flogger.debug(`Current playlist '${currentPlaylist.name}' and it has ${currentPlaylist.songs.length} songs. Current index: ${currentPlaylist.index}.`);

    let playlistSongsPromise = null;
    let nextSongIndex = null;
    // if next song goes beyond the maximum index
    if (playlistName != currentPlaylist.name || currentPlaylist.index >= currentPlaylist.songs.length - 1) {
        flogger.debug(`Re-fetching songs in playlist: ${playlistName}`);
        playlistSongsPromise = backendMetadataApi.playlistSongs(playlistName).then(playlistSongs => {
            flogger.debug(`Fetched ${playlistSongs.length} songs from ${playlistName}`);

            let remainingSongsId = currentPlaylist.songs.slice(currentPlaylist.index).map(song => song.id);
            flogger.debug(`Remaining songs IDs: ${remainingSongsId}`);
            let fetchedSongsId = playlistSongs.map(song => song.id);
            flogger.debug(`Fetched songs IDs: ${remainingSongsId}`);
            if(_.difference(fetchedSongsId, remainingSongsId).length > 0) {
                flogger.debug(`Fetched song contains new songs`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLIST_SONGS_UPDATED, playlistSongs, playlistName});
                // The reduced version translates the JSON to internal interface
                return storeContainer.store.getState().currentPlaylist.songs;
            } else {
                flogger.debug(`No new songs in fetched playlist. Returning current songs`);
                return null;
            }
        });
        nextSongIndex = 0;
    } else {
        flogger.debug("using existing playlist tracks");
        playlistSongsPromise = Promise.resolve(currentPlaylist.songs);
        nextSongIndex = currentPlaylist.index + 1;
    }

    return playlistSongsPromise.then(playlistSongs => {
        flogger.debug(`Returning song ${nextSongIndex} in playlist`);

        if(playlistSongs) {
            return playlistSongs[nextSongIndex];
        } else {
            flogger.debug(`No playlist songs were given - No next song is returned`);
            return null;
        }
    });
}

function markSongAsPlayed(song) {
    let flogger = loggerCreator(markSongAsPlayed.name, logger);

    flogger.debug(`${formatSong(song)} in progress`);
    return backendMetadataApi.updateLastPlayed(song.id)
        .then(() => {
            flogger.debug(`${formatSong(song)} complete`);
        });
}

// Tries to get the sound from SoundManager, if fails, tries to load it
function getOrLoadSound(song) {
    let flogger = loggerCreator(getOrLoadSound.name, logger);

    flogger.debug(`${formatSong(song)}`);
    return Promise.resolve(getSoundBySong(song))
        .then(function (sound) {
            if (sound && sound.loaded) {
                flogger.debug(`Sound was already loaded`);
                return sound;
            } else {
                flogger.debug(`Loading sound`);
                return loadSound(song);
            }
        });
}

// resolves to the played/paused sound on success
function playToggle(song, playOptions) {
    let flogger = loggerCreator(playToggle.name, logger);

    flogger.debug(`${formatSong(song)} with options: ${playOptions}`);
    return getOrLoadSound(song).then(wrappedSound => {
        if (!wrappedSound.loaded) {
            let message = "Sound should be loaded at this point: " + formatSong(song);
            flogger.error(message);
            throw new Error(message);
        }

        if (wrappedSound.playState == 0 || wrappedSound.paused) {
            wrappedSound.play(playOptions);
            storeContainer.store.dispatch({type: actionTypes.SONG_PLAY});

            flogger.debug(`Play`);
        } else {
            wrappedSound.pause();
            storeContainer.store.dispatch({type: actionTypes.SONG_PAUSE});

            flogger.debug(`Pause`);
        }

        return song;
    });
}

// finds the next song in the playlist and loads it
function playNextSongInPlaylist(playlistName) {
    let flogger = loggerCreator(playNextSongInPlaylist.name, logger);
    flogger.debug(playlistName);

    storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_PROGRESS});
    let nextSong = null;
    return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist)
        .then(function (nextSongArg) {
            flogger.debug(`Got next song: ${formatSong(nextSongArg)}`);
            nextSong = nextSongArg;
            return getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {
            storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_COMPLETE, songData: nextSong});
            storeContainer.store.dispatch({type: actionTypes.PLAYLIST_INDEX_INC});
            flogger.debug(`Loaded sound`);
        })
        .then(() => playTogglePlaylist(playlistName, nextSong)
            .then(()=> {
                flogger.debug(`Getting next song to preload`);
                return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist);
            })
            .then((song) => {
                flogger.debug(`Got song to preload: ${formatSong(song)}`);
                if(song) {
                    return getOrLoadSound(song);
                } else {
                    flogger.debug(`No song was preloaded`);
                    return null;
                }
            })
            // NOTE: It is important to catch preload errors here, otherwise, the error would trigger a `playNextSongInPlaylist`
            .catch(err => {
                let message = `Preload failed. would not try to preload anything else: ${err}`;
                flogger.error(message);
                logger.error(message);
            }))
        .catch(function (err) {
            logger.error(`Failed to load song ${formatSong(nextSong)}: Will mark it as read and proceed to next one. Error: ${err}`);
            markSongAsPlayed(nextSong)
                .then(function () {
                    logger.debug(`Marked as read. Getting next song.`);
                    storeContainer.store.dispatch({type: actionTypes.PLAYLIST_INDEX_INC});
                    return playNextSongInPlaylist(playlistName);
                });
        })
}

// plays/pauses the given sound in a playlist mode:
// * start next song on finish
function playTogglePlaylist(playlistName, song) {
    let flogger = loggerCreator(playTogglePlaylist.name, logger);

    return playToggle(song, {
        onfinish: () => {
            flogger.debug(`Song finished: ${formatSong(song)}. Marking as read`);
            markSongAsPlayed(song)
                .then(() => {
                    flogger.debug(`Proceeding to next song in playlist '${playlistName}'`);
                    return playNextSongInPlaylist(playlistName)
                });
        }
    })
}

export function startPlayingPlaylistAction(playlistName) {
    let flogger = loggerCreator(startPlayingPlaylistAction.name, logger);
    flogger.debug(playlistName);

    return function () {
        stopAll();
        return playNextSongInPlaylist(playlistName);
    }
}

export function playTogglePlaylistAction(playlistName, currentSong) {
    let flogger = loggerCreator(playTogglePlaylistAction.name, logger);
    flogger.debug(playlistName, formatSong(currentSong));

    return function () {
        return playTogglePlaylist(playlistName, currentSong);
    }
}

export function playNextSongAction(playlistName, currentSong) {
    let flogger = loggerCreator(playNextSongAction.name, logger);
    flogger.debug(playlistName, formatSong(currentSong));

    return function () {
        stopAll();
        markSongAsPlayed(currentSong)
            .then(function () {
                logger.debug(`Marked as read - Continue to play playlist: ${playlistName}`);
                return playNextSongInPlaylist(playlistName);
            });
    }
}

export function changeRating(currentSong, newRating) {
    let flogger = loggerCreator(changeRating.name, logger);
    flogger.debug(`${formatSong(currentSong)} new rating: ${newRating}`);

    return function () {
        storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_PROGRESS});
        backendMetadataApi.updateRating(currentSong.id, newRating)
            .then(() => {
                flogger.debug(`Success`);
                storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_COMPLETE, newRating});
            })
            .catch(err => {
                flogger.error(`Failed: ${err}`);
                storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_ERROR});
            });
    }
}

export function loadAvailablePlaylists() {
    let fLogger = loggerCreator(loadAvailablePlaylists.name, logger);
    fLogger.debug("Loading...");

    return function () {
        storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_PROGRESS});
        backendMetadataApi.playlists()
            .then((playlists) => {
                fLogger.debug(`Success`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_COMPLETE, playlists});
            })
            .catch(err => {
                fLogger.error(`Failed: ${err}`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_ERROR});
            });
    }
}