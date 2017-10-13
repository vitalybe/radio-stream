import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("player_real");

import { observable, action, computed } from "mobx";
import retries from "app/utils/retries";
import assert from "app/utils/assert";
import Playlist from "app/stores/player/playlist/playlist.web";
import * as wrappedSoundManager from "app/stores/player/wrapped_sound/wrapped_sound_manager";

class Player {
  MARK_PLAYED_AFTER_SECONDS = 20;

  @observable isPlaying = false;
  @observable currentPlaylist = null;

  @observable loadingError = null;

  @computed
  get currentSong() {
    return this.currentPlaylist ? this.currentPlaylist.currentSong : null;
  }

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);

    logger.info(`initializing soundmanager2: ${wrappedSoundManager.setup}`);
    wrappedSoundManager.setup();
  }

  _onPlayProgress(seconds) {
    if (
      this.currentSong &&
      this.currentSong.markingAsPlayedPromise === null &&
      seconds >= this.MARK_PLAYED_AFTER_SECONDS
    ) {
      return this.currentSong.markAsPlayed();
    }
  }

  async changePlaylist(playlistName) {
    let logger = loggerCreator("changePlaylist", moduleLogger);

    await this.stop();

    logger.info(`setting playlist to ${playlistName}`);

    this.currentPlaylist = new Playlist(playlistName);

    logger.info(`subscribing to playlist events: ${this.currentPlaylist.subscribePlayProgress}`);
    this.currentPlaylist.subscribePlayProgress(this._onPlayProgress.bind(this));
    this.currentPlaylist.subscribeFinish(this.playNext.bind(this));
  }

  @action
  pause() {
    let logger = loggerCreator("pause", moduleLogger);

    let promise = Promise.resolve();

    if (this.currentSong) {
      promise = this.currentSong.pauseSound();
    }

    this.isPlaying = false;

    return promise;
  }

  @action
  play() {
    let logger = loggerCreator("play", moduleLogger);

    assert(this.currentPlaylist, "unexpected: playlist isn't set");

    if (this.currentSong) {
      this.currentSong.playSound();
    } else {
      this.playNext();
    }

    this.isPlaying = true;
  }

  @action
  playPauseToggle() {
    let logger = loggerCreator("playPauseToggle", moduleLogger);

    if (this.isPlaying) {
      logger.info(`pause`);
      this.pause();
    } else {
      logger.info(`play`);
      this.play();
    }
  }

  async _preloadNextSong() {
    let logger = loggerCreator(this._preloadNextSong.name, moduleLogger);

    try {
      logger.info(`peeking next song`);
      let peekedSong = await this.currentPlaylist.peekNextSong();
      logger.info(`loading peeked song: ${peekedSong.toString()}`);
      return peekedSong.load();
    } catch (err) {
      logger.warn(`failed to peek the next song: ${err.stack}`);
    }
  }

  async _finishCurrentlyPlayingSong() {
    const logger = loggerCreator("_handleCurrentlyPlayingSong", moduleLogger);

    let previousSong = this.currentSong;
    if (previousSong) {
      logger.info(`previous song: ${previousSong.toString()}`);

      logger.info(`previous song - pausing playing song`);
      previousSong.pauseSound();

      logger.info(`previous song - making sure was marked as played`);
      if (previousSong.markingAsPlayedPromise) {
        logger.info(`previous song - marking as played`);
        await previousSong.markAsPlayed();
      } else {
        logger.info(`previous song - no need to mark as played`);
      }
    }
  }

  async playNext() {
    let logger = loggerCreator(this.playNext.name, moduleLogger);

    assert(this.currentPlaylist, "invalid state");

    await this._finishCurrentlyPlayingSong();

    await retries.promiseRetry(async lastError => {
      this.loadingError = lastError && lastError.toString();
      let nextSong = await this.currentPlaylist.nextSong();

      if (nextSong !== null) {
        logger.info(`got next song: ${nextSong.toString()}`);

        logger.info(`playing sound`);
        await nextSong.playSound();
      } else {
        logger.info(`no next song returned - playlist is empty`);
        this.loadingError = "Playlist is empty - No additional songs found";
      }
    });

    await this._preloadNextSong();
  }

  async playIndex(index) {
    const logger = loggerCreator("playIndex", moduleLogger);
    assert(this.currentPlaylist, "invalid state");

    await this._finishCurrentlyPlayingSong();

    logger.info(`playing song index: ${index}`);
    let song = this.currentPlaylist.skipToSongByIndex(index);
    song.setSoundPosition(0);
    await song.playSound();
  }

  @action
  stop() {
    let logger = loggerCreator("stop", moduleLogger);

    return this.pause().then(() => {
      logger.info(`setting song to null`);
    });
  }

  @computed
  get isLoading() {
    return !(this.currentSong && this.currentSong.loadedSound);
  }
}

export const player = new Player();
