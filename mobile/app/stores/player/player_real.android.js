'use strict';
import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("player_real.android");

import {observable, computed, action} from "mobx";
import {NativeModules, DeviceEventEmitter, AppState} from 'react-native';

import Playlist from './android/playlist'
import Song from './android/song'
import {globalSettings} from '../../utils/settings'
import navigator from '../navigator/navigator'


class Player {

  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  @observable isPlaying = false;
  @observable currentPlaylist = null;
  @observable song = null;

  @observable isLoading = true;
  @observable loadingError = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);

    this.proxy = NativeModules.PlayerJsProxy;
    this.statusCallback = null;

    DeviceEventEmitter.addListener(this.PLAYLIST_PLAYER_STATUS_EVENT, event => this.onPlayerStatusChanged(event));
    AppState.addEventListener('change', this.onHandleAppStateChange);
  }

  _sleep(millisecond) {
    return new Promise(resolve => setTimeout(resolve, millisecond)
    )
  }

  _updateSettings(host, user, password) {
    return this.proxy.updateSettings(host, user, password);
  }

  async _resolveWhenPlayerAvailable() {
    let logger = loggerCreator("resolveWhenPlayerAvailable", moduleLogger);

    logger.info(`is player available?`);
    let isAvailable = await this.proxy.isPlayerAvailable();
    if (isAvailable) {
      logger.info(`available - updating settings`);
      await this._updateSettings(globalSettings.host, globalSettings.user, globalSettings.password);
    } else {
      logger.info(`not available - retrying soon...`);
      await this._sleep(500);
      await this._resolveWhenPlayerAvailable()
    }
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

    const nativePlayerStatus = await this._resolveWhenPlayerAvailable().then(() => this.proxy.getPlayerStatus());
    this.onPlayerStatusChanged(nativePlayerStatus)
  }

  @action
  onPlayerStatusChanged(nativePlayerStatus) {
    let logger = loggerCreator("onPlayerStatusChanged", moduleLogger);
    logger.info(`${JSON.stringify(nativePlayerStatus)}`);

    const playlistPlayer = nativePlayerStatus.playlistPlayer;
    if (!playlistPlayer) {
      logger.info(`no playlist is currently active`);
      this.playlist = null;
      this.song = null;
      this.isLoading = true;
      this.loadingError = null;
    } else {
      logger.info(`setting playlist details`);
      this.isPlaying = playlistPlayer.isPlaying;
      this.isLoading = playlistPlayer.isLoading;
      this.loadingError = playlistPlayer.loadingError;

      let newPlaylist = new Playlist();
      newPlaylist.name = playlistPlayer.playlist.name;
      this.currentPlaylist = newPlaylist;

      let song = playlistPlayer.song;
      if (!song) {
        logger.info(`no song`);
        this.song = null;
      } else {

        if (!this.song || this.song.id !== song.id) {
          logger.info(`song changed`);
          this.song = new Song(song);
        }
        
        this.song.isMarkedAsPlayed = song.isMarkedAsPlayed
      }

    }
  }

  stopPlayer() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.stopPlayer());
  }

  onHandleAppStateChange = async (currentAppState) => {
    let logger = loggerCreator("onHandleAppStateChange", moduleLogger);
    logger.info(`${currentAppState}`);

    if (currentAppState === 'active') {
      logger.info(`updating player status`);
      await this.updatePlayerStatus();
      logger.info(`finishing getting status`);
      if (this.currentPlaylist && this.currentPlaylist.name) {
        logger.info(`no playlist selected - navigating to playlist collection`);
        navigator.navigateToPlaylistCollection();
      }
    }
  };

  @computed get loadingAction() {
    if (this.isLoading) {
      if (this.song) {
        return `${this.song.artist} - ${this.song.title}`;
      } else {
        return "Loading..."
      }
    }
  }

}

export default new Player();