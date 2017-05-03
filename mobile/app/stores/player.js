'use strict';
import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("player");

import {observable} from "mobx";
import {getArtistImage} from '../utils/backend_lastfm_api'
import nativePlayer from '../native_proxy/player_proxy'

class Player {

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

    nativePlayer.subscribePlayerStatusChanged(this.onPlayerStatusChanged.bind(this))
  }

  changePlaylist(playlistName) {
    return nativePlayer.changePlaylist(playlistName);
  }

  play() {
    return nativePlayer.play();
  }

  pause() {
    return nativePlayer.pause();
  }

  playNext() {
    return nativePlayer.playNext();
  }

  async updatePlayerStatus() {
    let logger = loggerCreator("updatePlayerStatus", moduleLogger);
    logger.info(`start`);

    const nativePlayerStatus = await nativePlayer.getPlayerStatus();
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
    return nativePlayer.stopPlayer();
  }

  updateSettings(host, user, password) {
    return nativePlayer.updateSettings(host, user, password);
  }
}

export default new Player();