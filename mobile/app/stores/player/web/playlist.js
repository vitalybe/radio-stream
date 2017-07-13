import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator(__filename);

import { observable } from "mobx";

import { Song } from "./song";
import backendMetadataApi from "app/utils/backend_metadata_api";

export default class Playlist {
  static RELOAD_PLAYLIST_AFTER_MINUTES = 60;

  @observable name = null;
  @observable songs = [];

  get currentIndex() {
    return this._currentIndex;
  }

  _currentIndex = 0;
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

  _reloadSongsIfNeeded() {
    let logger = loggerCreator(this._reloadSongsIfNeeded.name, moduleLogger);

    logger.info(`songs length: ${this.songs.length}. Current index: ${this._currentIndex}`);
    var isEnoughSongsInList = this.songs.length > 0 && this._currentIndex < this.songs.length;
    logger.info(`enough songs in list? ${isEnoughSongsInList}`);

    if (isEnoughSongsInList && this._areSongsOutOfDate() === false) {
      // playlist songs already loaded
      logger.info(`not reloading songs`);
      return Promise.resolve();
    } else {
      logger.info(`reloading songs`);
      return backendMetadataApi.playlistSongs(this.name).then(songsData => {
        logger.info(`loaded songs: ${songsData.length}`);
        this.songs = songsData.map(songData => new Song(songData));
        this._currentIndex = 0;

        this._lastReloadDate = new Date();
      });
    }
  }

  nextSong() {
    let logger = loggerCreator(this.nextSong.name, moduleLogger);

    return this.peekNextSong().then(song => {
      this._currentIndex++;
      logger.info(`new index: ${this._currentIndex}`);

      return song;
    });
  }

  peekNextSong() {
    let logger = loggerCreator(this.peekNextSong.name, moduleLogger);

    return this._reloadSongsIfNeeded().then(() => {
      logger.info(`returning song by index: ${this._currentIndex}`);
      let song = this.songs[this._currentIndex];
      logger.info(`returning song: ${song}`);

      return song;
    });
  }
}
