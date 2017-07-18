import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("playlist");

import { computed, observable } from "mobx";
import Song from "./song";

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
      let song = this.songs[this.currentIndex];
      if (!song.loadedImageUrl) {
        song.loadImage();
      }
      return song;
    } else {
      return null;
    }
  }
  constructor(playlistData) {
    this.name = playlistData.name;
    this._currentIndex = playlistData.currentIndex;
    this.songs = playlistData.songs.map(songData => new Song(songData));
  }
}
