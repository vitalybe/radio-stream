import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("playlist");

import { computed, observable } from "mobx";
import Song from "../song/song";

export default class Playlist {
  @observable name = null;
  @observable songs = [];
  @observable _currentIndex = 0;

  @computed
  get currentIndex() {
    return this._currentIndex;
  }

  @computed
  get currentSong() {
    if (this.songs.length > this._currentIndex) {
      return this.songs[this.currentIndex];
    } else {
      return null;
    }
  }

  _updateAllData(playlistData) {
    this.name = playlistData.name;
    this._currentIndex = playlistData.currentIndex;
    this.songs = playlistData.songs.map(songData => new Song(songData));
  }

  constructor(playlistData) {
    loggerCreator("constructor", moduleLogger);
    this._updateAllData(playlistData);
  }

  update(playlistData) {
    const logger = loggerCreator("update", moduleLogger);

    let songData = playlistData.songs[playlistData.currentIndex];
    if (this.name === playlistData.name && this.currentSong && this.currentSong.id === songData.id) {
      logger.info(`updating current song information`);
      this.currentSong.isMarkedAsPlayed = songData.isMarkedAsPlayed;
    } else {
      logger.info(`updating all the data in the playlist`);
      this._updateAllData(playlistData);
    }
  }
}
