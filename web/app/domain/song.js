import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import {observable, action} from "mobx";
import assert from "../utils/assert"
import retries from "../utils/retries"

import * as backendMetadataApi from '../utils/backend_metadata_api'
import * as backendLastFm from '../utils/backend_lastfm_api'
import * as wrappedSoundManager from '../utils/wrapped_sound_manager'

export class Song {
  id = null;
  title = null;
  artist = null;
  album = null;
  playcount = null;
  lastplayed = null;
  path = null;
  @observable rating = null;

  @observable isMarkedAsPlayed = false;
  _markingAsPlayedPromise = null;

  @observable loadedSound = null;
  @observable loadedImageUrl = null;

  constructor(songData) {
    let logger = loggerCreator(this.constructor.name, moduleLogger);
    logger.info(`start`);

    this.title = songData.title;
    this.id = songData.id;
    this.artist = songData.artist;
    this.album = songData.album;
    // values: 0 to 100 in increments of 20
    this.rating = songData.rating;
    this.playcount = songData.playcount;
    this.lastplayed = songData.lastplayed;
    this.path = songData.path;

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

  subscribePlayProgress(callback) {
    this._onPlayProgressCallback = callback;
  }

  subscribeFinish(callback) {
    this._onFinishCallback = callback;
  }

  _loadSound() {
    let logger = loggerCreator(this._loadSound.name, moduleLogger);
    logger.info(`start - ${this.toString()}`);

    // NOTE: This will not load sound again it was loaded before
    return wrappedSoundManager.loadSound(this)
      .then(sound => {
        assert(sound && sound.loaded, "sound was not loaded");
        logger.info(`loaded successfully`);

        this.loadedSound = sound;
      });
  }

  _loadImage() {
    let logger = loggerCreator(this._loadImage.name, moduleLogger);
    logger.info(`start`);

    if (this.loadedImageUrl) {
      logger.info(`image already loaded`);
      return Promise.resolve();
    } else {
      logger.info(`loading artist image`);
      return backendLastFm.getArtistImage(this.artist).then(imageUrl => {
        logger.info(`image loaded`);
        this.loadedImageUrl = imageUrl;
      });
    }


  }

  load() {
    let logger = loggerCreator(this.load.name, moduleLogger);
    logger.info(`start`);

    return this._loadSound().then(() => {
      return this._loadImage().catch(err => {
        logger.error(`failed to load image: ${err}`);
      })
    })
  }

  playSound() {
    let logger = loggerCreator(this.playSound.name, moduleLogger);
    logger.info(`start`);

    let that = this;

    return this.load().then(() => {

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
      this.loadedSound.play(options);
    });
  }

  pauseSound() {
    let logger = loggerCreator(this.pauseSound.name, moduleLogger);
    logger.info(`start`);

    return this.load().then(() => {
      this.loadedSound.pause()
    })
  }

  changeRating(newRating) {
    let logger = loggerCreator(this.changeRating.name, moduleLogger);
    logger.info(`start: ${newRating}`);

    backendMetadataApi.updateRating(this.id, newRating)
      .then(() => {
        logger.info(`Success`);
        this.rating = newRating;
      });
  }

  markAsPlayed() {
    let logger = loggerCreator(this.markAsPlayed.name, moduleLogger);

    logger.debug(`start: ${this.toString()}`);
    if (!this._markingAsPlayedPromise) {
      this._markingAsPlayedPromise = retries.promiseRetry(() => backendMetadataApi.updateLastPlayed(this.id))
        .then(() => {
          logger.debug(`complete: ${this.toString()}`);

          this.isMarkedAsPlayed = true;
          this.markingAsPlayedPromise = null;
        });
    }

    return this._markingAsPlayedPromise;
  }

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}