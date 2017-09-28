"use strict";
import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("player_real.android");

import { observable, computed, action } from "mobx";
import { NativeModules, DeviceEventEmitter, AppState } from "react-native";

import Playlist from "./playlist/playlist.android";
import settings from "app/utils/settings/settings";
import sleep from "app/utils/sleep";
import constants from "app/utils/constants";

class Player {
  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  @observable isPlaying = false;
  @observable currentPlaylist = null;

  @computed
  get currentSong() {
    return this.currentPlaylist ? this.currentPlaylist.currentSong : null;
  }

  @observable isLoading = true;
  @observable loadingError = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);

    this.proxy = NativeModules.PlayerJsProxy;
    this.statusCallback = null;

    DeviceEventEmitter.addListener(this.PLAYLIST_PLAYER_STATUS_EVENT, event => this.onPlayerStatusChanged(event));
    AppState.addEventListener("change", this.onHandleAppStateChange);
  }

  async _resolveWhenPlayerAvailable() {
    let logger = loggerCreator("resolveWhenPlayerAvailable", moduleLogger);

    logger.info(`is player available?`);
    let isAvailable = await this.proxy.isPlayerAvailable();
    if (isAvailable) {
      logger.info(`available - updating settings`);
      await this.proxy.updateSettings(settings.host, settings.user, settings.password, constants.MOCK_MODE);
    } else {
      logger.info(`not available - retrying soon...`);
      await sleep(500);
      await this._resolveWhenPlayerAvailable();
    }
  }

  changePlaylist(playlistName) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.changePlaylist(playlistName));
  }

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
    this.onPlayerStatusChanged(nativePlayerStatus);
  }

  @action
  onPlayerStatusChanged(nativePlayerStatus) {
    let logger = loggerCreator("onPlayerStatusChanged", moduleLogger);
    logger.info(`${JSON.stringify(nativePlayerStatus)}`);

    const playlistPlayer = nativePlayerStatus.playlistPlayer;
    if (!playlistPlayer) {
      logger.info(`no playlist is currently active`);
      this.currentPlaylist = null;
      this.isLoading = true;
      this.loadingError = null;
    } else {
      logger.info(`setting playlist details`);
      this.isPlaying = playlistPlayer.isPlaying;
      this.isLoading = playlistPlayer.isLoading;
      this.loadingError = playlistPlayer.loadingError;
      if (!this.currentPlaylist) {
        this.currentPlaylist = new Playlist(playlistPlayer.playlist);
      } else {
        this.currentPlaylist.update(playlistPlayer.playlist);
      }
    }
  }

  playIndex(index) {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.playIndex(index));
  }

  stop() {
    return this._resolveWhenPlayerAvailable().then(() => this.proxy.stopPlayer());
  }

  onHandleAppStateChange = async currentAppState => {
    let logger = loggerCreator("onHandleAppStateChange", moduleLogger);
    logger.info(`${currentAppState}`);

    if (currentAppState === "active") {
      logger.info(`updating player status`);
      await this.updatePlayerStatus();
      logger.info(`finishing getting status`);
    }
  };
}

export const player = new Player();
