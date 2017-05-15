'use strict';
import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("player");

import {observable} from "mobx";
import {NativeModules, DeviceEventEmitter, AppState} from 'react-native';

import Playlist from './android/playlist'
import Song from './android/song'
import {globalSettings} from '../utils/settings'
import {getArtistImage} from '../utils/backend_lastfm_api'


class Player {

  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  @observable isPlaying = false;
  @observable currentPlaylist = null;
  @observable song = null;

  @observable isLoading = false;
  @observable loadingAction = null;
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

  onPlayerStatusChanged(nativePlayerStatus) {
    let logger = loggerCreator("onPlayerStatusChanged", moduleLogger);
    logger.info(`${JSON.stringify(nativePlayerStatus)}`);

    const playlistPlayer = nativePlayerStatus.playlistPlayer;
    if (!playlistPlayer) {
      logger.info(`no playlist player was provided`);
      this.playlist = null;
      this.song = null;
    } else {
      logger.info(`setting playlist details`);
      let newPlaylist = new Playlist();
      newPlaylist.name = playlistPlayer.playlist.name;
      this.currentPlaylist = newPlaylist;

      this.isLoading = playlistPlayer.isLoading;
      this.loadingError = playlistPlayer.loadingError;
      if (this.isLoading) {
        if (playlistPlayer.song) {
          this.loadingAction = `${playlistPlayer.song.artist} - ${playlistPlayer.song.title}`;
        } else {
          this.loadingAction = "Loading..."
        }
      }
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

        this.song = new Song();
        this.song.id = song.id;
        this.song.artist = song.artist;
        this.song.title = song.title;
        this.song.album = song.album;
        this.song.rating = song.rating;


      } else {
        logger.info(`no song details`);

        this.song = null;
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
        // TODO: Access navigator and redirect at this point
        // this.props.navigator.navigateToPlaylistCollection();
      }
    }
  };

}

export default new Player();