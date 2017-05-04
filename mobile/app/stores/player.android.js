'use strict';
import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("player");

import {observable} from "mobx";
import {getArtistImage} from '../utils/backend_lastfm_api'
import {NativeModules, DeviceEventEmitter} from 'react-native';


class Player {

  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  @observable playlistName = "";
  @observable isLoading = true;
  @observable isPlaying = false;
  @observable loadingError = "";

  @observable songId = null;
  @observable songArtist = null;
  @observable songTitle = null;
  @observable songAlbum = null;
  @observable songRating = null;
  @observable songArtUri = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    logger.info(`start`);

    this.proxy = NativeModules.PlayerJsProxy;
    this.statusCallback = null;

    DeviceEventEmitter.addListener(this.PLAYLIST_PLAYER_STATUS_EVENT, event => this.onPlayerStatusChanged(event));
  }

  _sleep(millisecond) {
    return new Promise(resolve => setTimeout(resolve, millisecond)
    )
  }

  _resolveWhenPlayerAvailable() {
    let logger = loggerCreator("resolveWhenPlayerAvailable", moduleLogger);
    logger.info(`start`);

    return this.proxy.isPlayerAvailable().then(isAvailable => {
      if (!isAvailable) {
        logger.info(`not available - retrying`);
        return this._sleep(500).then(() => this._resolveWhenPlayerAvailable());
      }
    });
  }

  updateSongRating(songId, newRating) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.updateSongRating(songId, newRating));
  }

  changePlaylist(playlistName) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.changePlaylist(playlistName));
  }

  play() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.play());
  }

  pause() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.pause());
  }

  playNext() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.playNext());
  }

  async updatePlayerStatus() {
    let logger = loggerCreator("updatePlayerStatus", moduleLogger);
    logger.info(`start`);

    const nativePlayerStatus = await this._resolveWhenPlayerAvailable().then(() => this.proxy.getPlayerStatus());
    this.onPlayerStatusChanged(nativePlayerStatus)
  }

  onPlayerStatusChanged(nativePlayerStatus) {
    let logger = loggerCreator("onPlayerStatusChanged", moduleLogger);
    logger.info(`start: ${JSON.stringify(nativePlayerStatus)}`);

    const playlistPlayer = nativePlayerStatus.playlistPlayer;
    if (!playlistPlayer) {
      logger.info(`no playlist player was provided`);
      this.playlistName = "";
      this.isPlaying = false;
    } else {
      logger.info(`setting playlist details`);
      this.playlistName = playlistPlayer.playlist.name;

      this.isLoading = playlistPlayer.isLoading;
      this.loadingError = playlistPlayer.loadingError;
      logger.info(`isPlaying change: ${this.isPlaying} => ${playlistPlayer.isPlaying}`);
      this.isPlaying = playlistPlayer.isPlaying;

      let song = playlistPlayer.song;
      if (song) {
        logger.info(`setting song details`);

        if (song.artist && song.artist !== this.songArtist) {
          logger.info(`artist changed from '${this.songArtist}' to '${song.artist}' - reloading album cover`);
          this.songArtUri = null;
          getArtistImage(song.artist).then(imageUri => {
            logger.info(`got album art uri: ${imageUri}`);
            this.songArtUri = imageUri;
          })
        }

        this.songId = song.id;
        this.songArtist = song.artist;
        this.songTitle = song.title;
        this.songAlbum = song.album;
        this.songRating = song.rating;
      } else {
        logger.info(`no song details`);

        this.songId = null;
        this.songArtist = null;
        this.songTitle = null;
        this.songAlbum = null;
        this.songRating = null;
      }
    }
  }

  stopPlayer() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.stopPlayer());
  }

  updateSettings(host, user, password) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.updateSettings(host, user, password));
  }
}

export default new Player();