'use strict';
import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_proxy");

import {NativeModules, DeviceEventEmitter} from 'react-native';

class PlayerProxy {

  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  constructor() {
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

  getPlayerStatus() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.getPlayerStatus());
  }

  stopPlayer() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.stopPlayer());
  }

  updateSettings(host, user, password) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.updateSettings(host, user, password));
  }

  subscribePlayerStatusChanged(callback) {
    this.statusCallback = callback;
  }

  onPlayerStatusChanged(nativePlayer) {
    if (this.statusCallback) {
      this.statusCallback(nativePlayer)
    }
  }
}

export default new PlayerProxy();