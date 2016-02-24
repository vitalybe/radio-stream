import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import * as lastFm from '../utils/backend_lastfm_api'
import storeContainer from '../utils/store_container'
import { getSoundBySong, loadSound, stopAll } from '../utils/wrapped_sound_manager'
import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as actionTypes from './action_types'
import { formatSong } from '../utils/util'


function getNextSongInPlaylist(playlistName, currentPlaylist) {
    let logger = loggerCreator(getNextSongInPlaylist.name, moduleLogger);

    logger.debug(`Getting next song in ${playlistName}`);
    logger.debug(`Current playlist '${currentPlaylist.name}' and it has ${currentPlaylist.songs.length} songs. Current index: ${currentPlaylist.index}.`);

    let playlistSongsPromise = null;
    let nextSongIndex = null;
    // if next song goes beyond the maximum index
    if (playlistName != currentPlaylist.name || currentPlaylist.index >= currentPlaylist.songs.length - 1) {
        logger.debug(`Re-fetching songs in playlist: ${playlistName}`);
        playlistSongsPromise = backendMetadataApi.playlistSongs(playlistName).then(playlistSongs => {
            logger.debug(`Fetched ${playlistSongs.length} songs from ${playlistName}`);

            let remainingSongsId = currentPlaylist.songs.slice(currentPlaylist.index).map(song => song.id);
            logger.debug(`Remaining songs IDs: ${remainingSongsId}`);
            let fetchedSongsId = playlistSongs.map(song => song.id);
            logger.debug(`Fetched songs IDs: ${remainingSongsId}`);
            if (_.difference(fetchedSongsId, remainingSongsId).length > 0) {
                logger.debug(`Fetched song contains new songs`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLIST_SONGS_UPDATED, playlistSongs, playlistName});
                // The reduced version translates the JSON to internal interface
                return storeContainer.store.getState().currentPlaylist.songs;
            } else {
                logger.debug(`No new songs in fetched playlist. Returning current songs`);
                return null;
            }
        });
        nextSongIndex = 0;
    } else {
        logger.debug("using existing playlist tracks");
        playlistSongsPromise = Promise.resolve(currentPlaylist.songs);
        nextSongIndex = currentPlaylist.index + 1;
    }

    return playlistSongsPromise.then(playlistSongs => {
        logger.debug(`Returning song ${nextSongIndex} in playlist`);

        if (playlistSongs) {
            return playlistSongs[nextSongIndex];
        } else {
            logger.debug(`No playlist songs were given - No next song is returned`);
            return null;
        }
    });
}

function markSongAsPlayed(song) {
    let logger = loggerCreator(markSongAsPlayed.name, moduleLogger);

    logger.debug(`${formatSong(song)} in progress`);
    return backendMetadataApi.updateLastPlayed(song.id)
        .then(() => {
            logger.debug(`${formatSong(song)} complete`);
        });
}

// Tries to get the sound from SoundManager, if fails, tries to load it
function getOrLoadSound(song) {
    let logger = loggerCreator(getOrLoadSound.name, moduleLogger);

    logger.debug(`${formatSong(song)}`);
    return Promise.resolve(getSoundBySong(song))
        .then(function (sound) {
            if (sound && sound.loaded) {
                logger.debug(`Sound was already loaded`);
                return sound;
            } else {
                logger.debug(`Loading sound`);
                return loadSound(song);
            }
        });
}

// resolves to the played/paused sound on success
function playToggle(song, playOptions) {
    let logger = loggerCreator(playToggle.name, moduleLogger);

    logger.debug(`${formatSong(song)} with options: ${playOptions}`);
    return getOrLoadSound(song).then(wrappedSound => {
        if (!wrappedSound.loaded) {
            let message = "Sound should be loaded at this point: " + formatSong(song);
            logger.error(message);
            throw new Error(message);
        }

        if (wrappedSound.playState == 0 || wrappedSound.paused) {
            wrappedSound.play(playOptions);
            storeContainer.store.dispatch({type: actionTypes.SONG_PLAY});
            logger.debug(`Play`);

            lastFm.updateNowPlaying(song);
        } else {
            wrappedSound.pause();
            storeContainer.store.dispatch({type: actionTypes.SONG_PAUSE});

            logger.debug(`Pause`);
        }

        return song;
    });
}

function preloadNextSong(playlistName) {
    let logger = loggerCreator(preloadNextSong.name, moduleLogger);
    logger.debug("Start");

    return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist)
        .then((song) => {
            logger.debug(`Got song to preload: ${formatSong(song)}`);
            if (song) {
                return getOrLoadSound(song);
            } else {
                logger.debug(`No song was preloaded`);
                return null;
            }
        })
        // NOTE: It is important to catch preload errors here, otherwise, the error would trigger a `playNextSongInPlaylist`
        .catch(err => {
            let message = `Preload failed. would not try to preload anything else: ${err}`;
            logger.error(message);
        });
}

function loadArtistMetadata(artist) {
    let logger = loggerCreator(loadArtistMetadata.name, moduleLogger);
    logger.debug("Start");

    lastFm.getArtist(artist).then(artistData => {
        storeContainer.store.dispatch({type: actionTypes.ARTIST_LOAD_COMPLETE, value: artistData});
    }).catch(err => {
        logger.warn(`Failed to fetch artist ${artist} metadata: ${err}`);
    });

}

// finds the next song in the playlist and loads it
function playNextSongInPlaylist(playlistName) {
    let logger = loggerCreator(playNextSongInPlaylist.name, moduleLogger);
    logger.debug(playlistName);

    storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_PROGRESS});
    let nextSong = null;
    return getNextSongInPlaylist(playlistName, storeContainer.store.getState().currentPlaylist)
        .then(function (nextSongArg) {
            logger.debug(`Got next song: ${formatSong(nextSongArg)}`);
            nextSong = nextSongArg;
            return getOrLoadSound(nextSong);
        })
        .then(function (wrappedSound) {
            storeContainer.store.dispatch({type: actionTypes.SONG_LOAD_COMPLETE, songData: nextSong});
            storeContainer.store.dispatch({type: actionTypes.PLAYLIST_INDEX_INC});
            logger.debug(`Loaded sound`);
        })
        .then(() => playTogglePlaylist(playlistName, nextSong))
        .then(() => loadArtistMetadata(nextSong.artist))
        .then(() => preloadNextSong(playlistName))
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
    let logger = loggerCreator(playTogglePlaylist.name, moduleLogger);

    return playToggle(song, {
        onfinish: () => {
            logger.debug(`Song finished: ${formatSong(song)}. Marking as read`);
            markSongAsPlayed(song)
                .then(() => {
                    logger.debug(`Proceeding to next song in playlist '${playlistName}'`);
                    return playNextSongInPlaylist(playlistName)
                });

            lastFm.scrobble(song);
        }
    })
}

export function startPlayingPlaylistAction(playlistName) {
    let logger = loggerCreator(startPlayingPlaylistAction.name, moduleLogger);
    logger.debug(playlistName);

    return function () {
        stopAll();
        return playNextSongInPlaylist(playlistName);
    }
}

export function playTogglePlaylistAction(playlistName, currentSong) {
    let logger = loggerCreator(playTogglePlaylistAction.name, moduleLogger);
    logger.debug(playlistName, formatSong(currentSong));

    return function () {
        return playTogglePlaylist(playlistName, currentSong);
    }
}

export function playNextSongAction(playlistName, currentSong) {
    let logger = loggerCreator(playNextSongAction.name, moduleLogger);
    logger.debug(playlistName, formatSong(currentSong));

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
    let logger = loggerCreator(changeRating.name, moduleLogger);
    logger.debug(`${formatSong(currentSong)} new rating: ${newRating}`);

    return function () {
        storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_PROGRESS});
        backendMetadataApi.updateRating(currentSong.id, newRating)
            .then(() => {
                logger.debug(`Success`);
                storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_COMPLETE, newRating});
            })
            .catch(err => {
                logger.error(`Failed: ${err}`);
                storeContainer.store.dispatch({type: actionTypes.RATING_UPDATE_ERROR});
            });
    }
}

export function loadAvailablePlaylists() {
    let logger = loggerCreator(loadAvailablePlaylists.name, moduleLogger);
    logger.debug("Loading...");

    return function () {
        storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_PROGRESS});
        backendMetadataApi.playlists()
            .then((playlists) => {
                logger.debug(`Success`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_COMPLETE, playlists});
            })
            .catch(err => {
                logger.error(`Failed: ${err}`);
                storeContainer.store.dispatch({type: actionTypes.PLAYLISTS_LOAD_ERROR});
            });
    }
}