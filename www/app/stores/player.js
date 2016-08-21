import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import assert from "../utils/assert"
import * as config from "../utils/config"
import * as backendMetadataApi from '../utils/backend_metadata_api'

import { CurrentPlaylist } from "./current_playlist"

export class Player {
    @observable isPlaying = false;
    @observable currentPlaylist = null;
    @observable song = null;
    @observable markedAsPlayed = false;

    constructor(playlistName) {
        this.currentPlaylist = new CurrentPlaylist(playlistName)
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
        assert(this.song && this.isPlaying && this.currentPlaylist, "invalid state");

        this.isPlaying = false;
        this.song.pauseSound();
    }

    @action play() {
        assert(this.currentPlaylist, "invalid state");

        this.isPlaying = true;
        if (this.song) {
            this.song.playSound();
        } else {
            this.next()
        }
    }

    @action next() {
        assert(this.song && this.currentPlaylist, "invalid state");

        this.currentPlaylist.nextSong()
            .then(action(nextSong => {
                this._changeSong(nextSong);
                return this.song.play();
            }))
            .then(() => {
                return this.currentPlaylist.peekNextSong();
            })
            .then((peekedSong) => {
                peekedSong.loadSound();
            })

    }
}
