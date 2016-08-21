import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import assert from "../utils/assert"
import * as config from "../utils/config"
import { observable, action } from "mobx";
import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as wrappedSoundManager from '../utils/wrapped_sound_manager'

class PlaylistMetadata {
    @observable name = null;
}

class PlaylistsMetadata {
    @observable value = [];
    @observable loading = false;
    @observable error = false;

    @action
    loadAvailablePlaylists() {
        let logger = loggerCreator(this.loadAvailablePlaylists.name, loggerCreator);
        logger.debug("Loading...");

        this.value.clear();
        this.loading = true;
        this.error = false;
        backendMetadataApi.playlists()
            .then(action((playlists) => {
                logger.debug(`Success`);

                let newPlaylists = playlists.map(playlistName => {
                    let playlistMetadata = new PlaylistMetadata();
                    playlistMetadata.name = playlistName;
                    return playlistMetadata;
                });

                this.value = observable(newPlaylists);
                this.loading = false;
            }))
            .catch(action(err => {
                logger.error(`Failed: ${err}`);
                this.error = true;
                this.loading = false;
            }));
    }
}

class PlayPercentCallbackData {
    callback = null;
    percent = 0;
    triggered = false;

    constructor(callback, percent) {
        this.callback = callback;
        this.percent = percent;

        this.triggered = false;
    }
}

class Song {
    id = null;
    title = null;
    artist = null;
    album = null;
    rating = null;
    playcount = null;
    lastplayed = null;
    path = null;

    @observable soundLoaded = false;
    @observable markedAsPlayed = false;

    constructor(songData) {
        this.title = songData.title;
        this.id = songData.id;
        this.artist = songData.artist;
        this.album = songData.album;
        this.rating = songData.rating;
        this.playcount = songData.playcount;
        this.lastplayed = songData.lastplayed;
        this.path = songData.path;
        this.soundLoaded = false;

        this._onFinishCallback = null;
        this._onPercentPlayedCallbackData = null;
    }

    _onWhilePlaying(sound) {
        if(this._onPercentPlayedCallbackData && !this._onPercentPlayedCallbackData.triggered) {
            let positionSeconds = Math.floor(sound.position/1000);

            if(!markedAsPlayed && lastPosition < positionSeconds) {
                lastPosition = positionSeconds;
                // Mark song as played after 5%
                if(lastPosition > sound.duration/1000/100*5) {
                    logger.debug(`Song played for ${lastPosition} seconds. Marking as played: ${formatSong(song)}.`);

                    markedAsPlayed = true;
                    markSongAsPlayed(song).then(() => {
                        storeContainer.store.dispatch({type: actionTypes.SONG_MARKED_AS_PLAYED})
                        logger.debug(`Marked as played: ${formatSong(song)}.`);
                    })
                }
            }
        }
    }

    @action loadSound() {
        let logger = loggerCreator(this.loadSound.name, moduleLogger);

        logger.debug(`${song.toString()}`);
        // NOTE: This will not load sound again it was loaded before
        return wrappedSoundManager.loadSound(song)
            .then(function (sound) {
                assert(sound && sound.loaded, "sound was not loaded");
                return sound;
            })
            .then(sound => {
                this.soundLoaded = true;
                return sound;
            });
    }

    onPercentPlayed(percent, callback) {
        this._onPercentPlayedCallbackData = new PlayPercentCallbackData(callback, percent);
    }

    onFinish(callback) {
        this._onFinishCallback = callback;
    }

    playSound() {
        let that = this;

        this.loadSound().then(sound => {

            let options = {};

            if (this._onFinishCallback) {
                options.onfinish = this._onFinishCallback
            }

            if (this._onPercentPlayedCallbackData) {
                options.whileplaying = function () {
                    // NOTE: callback functions of soundmanager provide the sound in "this" parameter
                    // so we can't alter "this"
                    that._onWhilePlaying(this)
                };
            }

            sound.play(options);
        });
    }

    pauseSound() {
        this.loadSound().then(sound => {
            sound.pause()
        })
    }
}

class CurrentPlaylist {
    @observable name = null;
    songs = [];
    currentIndex = -1;

    _loadSongs() {
        return new Promise(function (resolve, reject) {
            if (this.songs.length > 0 && this.currentIndex + 1 < this.songs.length) {
                // playlist songs already loaded
                resolve();
            } else {
                return backendMetadataApi.playlistSongs().then(songsData => {
                    this.songs = songsData.map(songData => new Song(songData))
                });
            }
        });
    };

    nextSong() {
        return this.peekNextSong().then((song) => {
            this.currentIndex++;

            return song;
        })
    }

    peekNextSong() {
        this._loadSongs()
            .then(() => {
                return this.songs[this.currentIndex]
            })
    }
}

class Player {
    @observable isPlaying = false;
    @observable playlist = null;
    @observable song = null;

    _markAsPlayed(song) {
        let logger = loggerCreator(this._markAsPlayed.name, moduleLogger);

        logger.debug(`${song.toString()} in progress`);
        return backendMetadataApi.updateLastPlayed(song.id).then(() => {
            song.markedAsPlayed = true;
            logger.debug(`${song.toString()} complete`);
        });
    }

    _changeSong(song) {
        assert(this.song, "song is required");

        if (this.song != song || this.song == null) {
            this.song = song;
            this.song.onFinish(this.next.bind(this));
            this.song.onPercentPlayed(config.MARK_PLAYED_PERCENT, this._markAsPlayed.bind(this, song));
        }
    }

    @action pause() {
        assert(this.song && this.isPlaying && this.playlist, "invalid state");

        this.isPlaying = false;
        this.song.pauseSound();
    }

    @action play() {
        assert(this.playlist, "invalid state");

        this.isPlaying = true;
        if (this.song) {
            this.song.playSound();
        } else {
            this.next()
        }
    }

    @action next() {
        assert(this.song && this.playlist, "invalid state");

        this.playlist.nextSong()
            .then(action(nextSong => {
                this._changeSong(nextSong);
                return this.song.play();
            }))
            .then(() => {
                return this.playlist.peekNextSong();
            })
            .then((peekedSong) => {
                peekedSong.loadSound();
            })

    }
}

class Store {
    @observable playlistsMetadata = new PlaylistsMetadata();

}

export default new Store()