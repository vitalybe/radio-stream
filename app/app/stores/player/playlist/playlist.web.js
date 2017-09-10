import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("playlist.web");

import { computed, observable } from "mobx";

import Song from "../song/song.web";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";

export default class Playlist {
  static RELOAD_PLAYLIST_AFTER_MINUTES = 60;

  @observable name = null;
  @observable songs = [];
  @observable _currentIndex = -1;

  _onPlayProgressCallback = null;
  _onFinishCallback = null;

  @computed
  get currentIndex() {
    return this._currentIndex;
  }

  @computed
  get currentSong() {
    const logger = loggerCreator("currentSong", moduleLogger);
    logger.info(`current index: ${this.currentIndex}`);
    if (this._currentIndex >= 0 && this.songs.length > 0) {
      return this.songs[this.currentIndex];
    } else {
      return null;
    }
  }

  _lastReloadDate = null;

  constructor(name) {
    this.name = name;
  }

  _areSongsOutOfDate() {
    let logger = loggerCreator(this._areSongsOutOfDate.name, moduleLogger);

    let result = null;
    if (!this._lastReloadDate) {
      logger.info(`no reload date found`);
      result = true;
    } else {
      let secondsSinceReload = new Date() - this._lastReloadDate;
      logger.info(`seconds since reload ${secondsSinceReload}`);
      let minutesSinceReload = secondsSinceReload / 1000 / 60;
      logger.info(`is minutes since reload ${minutesSinceReload} more than ${Playlist.RELOAD_PLAYLIST_AFTER_MINUTES}?`);

      result = minutesSinceReload >= Playlist.RELOAD_PLAYLIST_AFTER_MINUTES;
    }

    logger.info(`returning: ${result}`);
    return result;
  }

  _addSongsIfCurrentIsLast() {
    let logger = loggerCreator(this._addSongsIfCurrentIsLast.name, moduleLogger);

    logger.info(`songs length: ${this.songs.length}. Current index: ${this._currentIndex}`);
    var isEnoughSongsInList = this.songs.length > 0 && this._currentIndex + 1 < this.songs.length;
    logger.info(`enough songs in list? ${isEnoughSongsInList}`);

    if (isEnoughSongsInList && this._areSongsOutOfDate() === false) {
      // playlist songs already loaded
      logger.info(`not reloading songs`);
      return Promise.resolve();
    } else {
      logger.info(`reloading songs`);
      return backendMetadataApi.playlistSongs(this.name).then(songsData => {
        logger.info(`added songs: ${songsData.length}`);
        this.songs = [
          ...this.songs,
          ...songsData.map(songData => new Song(songData, this._onPlayProgressCallback, this._onFinishCallback)),
        ];
        logger.info(`loaded songs: ${songsData.length}`);

        this._lastReloadDate = new Date();
      });
    }
  }

  subscribePlayProgress(callback) {
    this._onPlayProgressCallback = callback;
  }

  subscribeFinish(callback) {
    this._onFinishCallback = callback;
  }

  nextSong() {
    let logger = loggerCreator(this.nextSong.name, moduleLogger);

    return this.peekNextSong().then(song => {
      this._currentIndex++;
      logger.info(`new index: ${this._currentIndex}`);

      return song;
    });
  }

  async peekNextSong() {
    let logger = loggerCreator(this.peekNextSong.name, moduleLogger);

    await this._addSongsIfCurrentIsLast();

    let nextIndex = this._currentIndex + 1;
    logger.info(`returning song by index: ${nextIndex}`);

    let song = this.songs[nextIndex];
    logger.info(`returning song: ${song}`);

    return song;
  }
}
