import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import assert from "../utils/assert"
import * as config from "../utils/config"
import * as backendMetadataApi from '../utils/backend_metadata_api'

export default class Player {
    @observable isPlaying = false;
    @observable currentPlaylist = null;
    @observable song = null;
    @observable isMarkedAsPlayed = false;

    constructor(playlist) {
        this.currentPlaylist = playlist;
    }

    _onPlayProgress(seconds) {
        if (this.isMarkedAsPlayed == false && seconds >= config.MARK_PLAYED_AFTER_SECONDS) {
            let logger = loggerCreator(this._onPlayProgress.name, moduleLogger);
            logger.info(`start`);

            this.isMarkedAsPlayed = true;
            logger.debug(`${this.song.toString()} in progress`);
            return backendMetadataApi.updateLastPlayed(this.song.id).then(() => {
                logger.debug(`${this.song.toString()} complete`);
            });

        }
    }

    @action pause() {
        this.isPlaying = false;
        if (this.song) {
            this.song.pauseSound();
        }
    }

    @action play() {
        assert(this.currentPlaylist, "invalid state");

        if (this.song) {
            this.song.playSound();
        } else {
            this.next()
        }

        this.isPlaying = true;
    }

    @action togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    @action next() {
        assert(this.currentPlaylist, "invalid state");

        if (this.song) {
            this.song.pauseSound();
        }

        this.currentPlaylist.nextSong()
            .then(action(nextSong => {
                if (this.song != nextSong || this.song == null) {
                    this.song = nextSong;
                    this.isMarkedAsPlayed = false;
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
        this.song = null;
    }

    @computed get isLoading() {
        if (this.song && this.song.loadedSound) {
            return false;
        } else {
            return true;
        }
    }
}
