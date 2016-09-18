import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import assert from "../utils/assert"
import * as config from "../utils/config"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export class Player {
    @observable isPlaying = false;
    @observable currentPlaylist = null;
    @observable song = null;
    @observable isMarkedAsPlayed = false;

    onStopCallback = null;

    constructor(playlist, onStopCallback) {
        this.currentPlaylist = playlist;
        this.onStopCallback = onStopCallback;
    }

    _markAsPlayed(song) {
        let logger = loggerCreator(this._markAsPlayed.name, moduleLogger);

        logger.debug(`${song.toString()} in progress`);
        return backendMetadataApi.updateLastPlayed(song.id).then(() => {
            song.isMarkedAsPlayed = true;
            logger.debug(`${song.toString()} complete`);
        });
    }

    _onPlayProgress(seconds) {
        if (this.isMarkedAsPlayed == false && seconds >= config.MARK_PLAYED_AFTER_SECONDS) {
            this.isMarkedAsPlayed = true;
            this._markAsPlayed(this.song)
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

    @action togglePlayPause() {
        if(this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    @action next() {
        assert(this.currentPlaylist, "invalid state");

        this.currentPlaylist.nextSong()
            .then(action(nextSong => {
                if (this.song != nextSong || this.song == null) {
                    this.song = nextSong;
                    this.song.subscribePlayProgress(this._onPlayProgress.bind(this));
                    this.song.subscribeFinish(this.next.bind(this));
                }

                return this.song.playSound();
            }))
            .then(() => {
                return this.currentPlaylist.peekNextSong();
            })
            .then((peekedSong) => {
                peekedSong.load();
            })

    }

    @action stop() {
        this.pause();
        this.onStopCallback()
    }

    @computed get isLoading() {
        if (this.song && this.song.loadedSound) {
            return false;
        } else {
            return true;
        }
    }
}
