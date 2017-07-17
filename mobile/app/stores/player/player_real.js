import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("player_real");

import { observable, action, computed } from "mobx";
import retries from "app/utils/retries";
import assert from "app/utils/assert";
import Playlist from "./web/playlist";
import * as wrappedSoundManager from "./web/wrapped_sound_manager";

class Player {
  MARK_PLAYED_AFTER_SECONDS = 20;

  @observable isPlaying = false;
  @observable currentPlaylist = null;

  @observable loadingAction = null;
  @observable loadingError = null;

  @computed
  get currentSong() {
    return this.currentPlaylist.currentSong;
  }

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);

    logger.info(`initializing soundmanager2`);
    wrappedSoundManager.setup();
  }

  _onPlayProgress(seconds) {
    if (
      this.currentSong &&
      this.currentSong.markingAsPlayedPromise === null &&
      seconds >= this.MARK_PLAYED_AFTER_SECONDS
    ) {
      let logger = loggerCreator(this._onPlayProgress.name, moduleLogger);

      return this.currentSong.markAsPlayed();
    }
  }

  async changePlaylist(playlistName) {
    let logger = loggerCreator("changePlaylist", moduleLogger);

    await this.stop();

    logger.info(`setting playlist to ${playlistName}`);
    this.currentPlaylist = new Playlist(playlistName);
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

  _preloadNextSong() {
    let logger = loggerCreator(this._preloadNextSong.name, moduleLogger);

    logger.info(`peeking next song`);
    return this.currentPlaylist
      .peekNextSong()
      .then(peekedSong => {
        logger.info(`loading peeked song: ${peekedSong.toString()}`);
        return peekedSong.load();
      })
      .catch(err => {
        logger.warn(`failed to peek the next song: ${err.stack}`);
      });
  }

  async playNext() {
    let logger = loggerCreator(this.playNext.name, moduleLogger);

    // time since last player - toggle-pause.
    // if too long, stop and clear playlist

    let previousSong = this.currentSong;

    assert(this.currentPlaylist, "invalid state");

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

    await retries.promiseRetry(async lastError => {
      this.loadingAction = `Loading next song...`;
      this.loadingError = lastError && lastError.toString();
      let nextSong = await this.currentPlaylist.nextSong();

      if (nextSong !== null) {
        logger.info(`got next song: ${nextSong.toString()}`);

        if (this.currentSong !== nextSong || this.currentSong === null) {
          this.currentSong = nextSong;
          logger.info(`subscribing to song events`);
          this.currentSong.subscribePlayProgress(this._onPlayProgress.bind(this));
          this.currentSong.subscribeFinish(this.playNext.bind(this));
        }

        this.loadingAction = `${nextSong.artist} - ${nextSong.title}`;
        logger.info(`playing sound`);
        await this.currentSong.playSound();
      } else {
        logger.info(`no next song returned - playlist is empty`);
        this.loadingError = "Playlist is empty - No additional songs found";
      }
    });

    await this._preloadNextSong();
  }

  @action
  stop() {
    let logger = loggerCreator("stop", moduleLogger);

    return this.pause().then(() => {
      logger.info(`setting song to null`);
      this.currentSong = null;
    });
  }

  @computed
  get isLoading() {
    return !(this.currentSong && this.currentSong.loadedSound);
  }
}

const player = new Player();
export default player;
