import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator(__filename);

import { extendObservable } from "mobx";
import assert from "app/utils/assert";
import retries from "app/utils/retries";

import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import * as backendLastFm from "app/utils/backend_lastfm_api";
import * as wrappedSoundManager from "../wrapped_sound/wrapped_sound_manager";
import SongActions from "../song_actions";

export default class Song {
  constructor(songData) {
    let logger = loggerCreator(this.constructor.name, moduleLogger);

    extendObservable(this, {
      title: songData.title,
      id: songData.id,
      artist: songData.artist,
      album: songData.album,
      // values: 0 to 100 in increments of 20
      rating: songData.rating,
      playcount: songData.playcount,
      lastplayed: songData.lastplayed,
      path: songData.path,

      isMarkedAsPlayed: false,
      loadedImageUrl: null,
      loadedSound: null,
    });

    this.markingAsPlayedPromise = null;

    this._onFinishCallback = null;
    this._onPlayProgressCallback = null;

    this._lastPositionSeconds = 0;

    this.actions = new SongActions(this);
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
    logger.info(`${this.toString()}`);

    // NOTE: This will not load sound again it was loaded before
    return wrappedSoundManager.loadSound(this).then(sound => {
      assert(sound && sound.loaded, "sound was not loaded");
      logger.info(`loaded successfully`);

      this.loadedSound = sound;
    });
  }

  async _loadImage() {
    let logger = loggerCreator(this._loadImage.name, moduleLogger);

    if (this.loadedImageUrl) {
      logger.info(`image already loaded`);
      return Promise.resolve();
    } else {
      logger.info(`loading artist image`);
      let imageUrl = await backendLastFm.getArtistImage(this.artist);

      logger.info(`image loaded: ${imageUrl}`);
      this.loadedImageUrl = imageUrl;
    }
  }

  async load() {
    let logger = loggerCreator(this.load.name, moduleLogger);

    await this._loadSound();
    try {
      await this._loadImage();
    } catch (err) {
      logger.warn(`failed to load image: ${err}`);
    }
  }

  playSound() {
    let logger = loggerCreator(this.playSound.name, moduleLogger);

    let that = this;

    return this.load().then(() => {
      logger.info(`loaded`);

      let options = {};

      if (this._onFinishCallback) {
        logger.info(`providing onfinish callback`);
        options.onfinish = this._onFinishCallback;
      }

      if (this._onPlayProgressCallback) {
        logger.info(`providing whileplaying callback`);
        options.whileplaying = function() {
          // NOTE: callback functions of soundmanager provide the sound in "this" parameter
          // so we can't alter "this"
          that._onPlayProgress(this);
        };
      }

      logger.info(`playing sound`);
      this.loadedSound.play(options);
    });
  }

  pauseSound() {
    let logger = loggerCreator(this.pauseSound.name, moduleLogger);

    return this.load().then(() => {
      this.loadedSound.pause();
    });
  }

  markAsPlayed() {
    let logger = loggerCreator(this.markAsPlayed.name, moduleLogger);

    logger.debug(`start: ${this.toString()}`);
    if (!this.markingAsPlayedPromise) {
      this.markingAsPlayedPromise = retries
        .promiseRetry(() => backendMetadataApi.updateLastPlayed(this.id))
        .then(() => {
          logger.debug(`complete: ${this.toString()}`);

          this.isMarkedAsPlayed = true;
        });
    }

    return this.markingAsPlayedPromise;
  }

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}
