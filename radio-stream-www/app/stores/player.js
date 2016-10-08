import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action, computed } from "mobx";
import retries from "../utils/retries"

import assert from "../utils/assert"
import * as config from "../utils/config"
import * as backendMetadataApi from '../utils/backend_metadata_api'

class Player {
    @observable isPlaying = false;
    @observable currentPlaylist = null;
    @observable song = null;

    constructor() {
    }

    _onPlayProgress(seconds) {
        if (this.song && this.song.isMarkedAsPlayed == false && seconds >= config.MARK_PLAYED_AFTER_SECONDS) {
            let logger = loggerCreator(this._onPlayProgress.name, moduleLogger);
            logger.info(`start`);

            return this.song.markAsPlayed();
        }
    }

    @action changePlaylist(playlist) {
        this.pause();
        this.currentPlaylist = playlist;
    }

    @action pause() {
        if (this.song) {
            this.song.pauseSound();
        }

        this.isPlaying = false;
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
        let logger = loggerCreator(this.next.name, moduleLogger);
        logger.info(`start`);

        let previousSong = this.song;
        this.song = null;

        assert(this.currentPlaylist, "invalid state");

        if (previousSong) {
            logger.info(`pausing playing song: ${previousSong}`);
            previousSong.pauseSound();
        }

        Promise.resolve()
            .then(() => {
                if (previousSong) {
                    logger.info(`making sure song was marked as played`);
                    return previousSong.markAsPlayed()
                }
            }).then(() => retries.promiseRetry(() => {
                return this.currentPlaylist.nextSong()
                    .then(action(nextSong => {

                        logger.info(`next song: ${nextSong}`);

                        if (this.song != nextSong || this.song == null) {
                            this.song = nextSong;
                            this.isMarkedAsPlayed = false;
                            this.song.subscribePlayProgress(this._onPlayProgress.bind(this));
                            this.song.subscribeFinish(this.next.bind(this));
                        }

                        return this.song.playSound();
                    }))
            }))
            .then(() => {
                logger.info(`peeking next song`);
                return this.currentPlaylist.peekNextSong();
            })
            .then((peekedSong) => {
                logger.info(`loading peeked song`);
                return peekedSong.load();
            })
            .catch(err => {
                logger.warn(`failed to peek the next song: ${err.stack}`);
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

export default new Player();