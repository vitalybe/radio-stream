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

        this._onPlayProgressCallback = null;
        this._lastPositionSeconds = 0;
    }

    _onPlayProgress(sound) {
        if(this._onPlayProgressCallback) {
            let positionSeconds = Math.floor(sound.position/1000);

            if(this._lastPositionSeconds < positionSeconds) {
                this._lastPositionSeconds = positionSeconds;

                this._onPlayProgressCallback(positionSeconds);
            }
        }
    }

    @action loadSound() {
        let logger = loggerCreator(this.loadSound.name, moduleLogger);

        logger.debug(`${this.toString()}`);
        // NOTE: This will not load sound again it was loaded before
        return wrappedSoundManager.loadSound(this)
            .then(function (sound) {
                assert(sound && sound.loaded, "sound was not loaded");
                return sound;
            })
            .then(sound => {
                this.soundLoaded = true;
                return sound;
            });
    }

    onPlayProgress(callback) {
        this._onPlayProgressCallback = callback;
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

            if (this._onPlayProgressCallback) {
                options.whileplaying = function () {
                    // NOTE: callback functions of soundmanager provide the sound in "this" parameter
                    // so we can't alter "this"
                    that._onPlayProgress(this)
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

    constructor(name) {
        this.name = name;
    }

    _loadSongs() {
        return new Promise(function (resolve) {
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
    @observable markedAsPlayed = false;

    constructor(playlistName) {
        this.playlist = new CurrentPlaylist(playlistName)
    }

    _markAsPlayed(song) {
        let logger = loggerCreator(this._markAsPlayed.name, moduleLogger);

        logger.debug(`${song.toString()} in progress`);
        return backendMetadataApi.updateLastPlayed(song.id).then(() => {
            song.markedAsPlayed = true;
            logger.debug(`${song.toString()} complete`);
        });
    }

    _onPlayProgress(seconds) {
        if(this.markedAsPlayed == false && seconds >= config.MARK_PLAYED_AFTER_SECONDS) {
            this.markedAsPlayed = true;
            this._markAsPlayed(this.song)
        }
    }

    _changeSong(song) {
        assert(this.song, "song is required");

        if (this.song != song || this.song == null) {
            this.song = song;
            this.song.onFinish(this.next.bind(this));
            this.song.onPlayProgress(this._onPlayProgress.bind(this));
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
    @observable player = null;

    createPlayer(playlistName) {
        this.player = new Player(playlistName);
    }

}

export default new Store()