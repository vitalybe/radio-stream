import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";
import assert from "../utils/assert"
import * as wrappedSoundManager from '../utils/wrapped_sound_manager'

export class Song {
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
        let logger = loggerCreator(this.constructor.name, moduleLogger);
        logger.info(`start`);

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
        
        logger.info(`new song: ${this.toString()}`);
    }

    _onPlayProgress(sound) {
        if (this._onPlayProgressCallback) {
            let positionSeconds = Math.floor(sound.position / 1000);

            if (this._lastPositionSeconds < positionSeconds) {
                this._lastPositionSeconds = positionSeconds;

                this._onPlayProgressCallback(positionSeconds);
            }
        }
    }

    @action loadSound() {
        let logger = loggerCreator(this.loadSound.name, moduleLogger);
        logger.info(`start - ${this.toString()}`);

        // NOTE: This will not load sound again it was loaded before
        return wrappedSoundManager.loadSound(this)
            .then(function (sound) {
                assert(sound && sound.loaded, "sound was not loaded");
                logger.info(`loaded successfully`);

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
        let logger = loggerCreator(this.playSound.name, moduleLogger);
        logger.info(`start`);

        let that = this;

        this.loadSound().then(sound => {

            logger.info(`loaded`);

            let options = {};

            if (this._onFinishCallback) {
                logger.info(`providing onfinish callback`);
                options.onfinish = this._onFinishCallback
            }

            if (this._onPlayProgressCallback) {
                logger.info(`providing whileplaying callback`);
                options.whileplaying = function () {
                    // NOTE: callback functions of soundmanager provide the sound in "this" parameter
                    // so we can't alter "this"
                    that._onPlayProgress(this)
                };
            }

            logger.info(`playing sound`);
            sound.play(options);
        });
    }

    pauseSound() {
        let logger = loggerCreator(this.pauseSound.name, moduleLogger);
        logger.info(`start`);

        this.loadSound().then(sound => {
            sound.pause()
        })
    }

    toString() {
        return `Song[Artist=${this.artist} Title=${this.title}]`;
    }
}