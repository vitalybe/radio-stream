import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("player_mock");

import { observable, action, computed } from "mobx";

import SongMock from "./mock/song_mock";
import PlaylistMock from "app/stores/player/mock/playlist_mock";

class PlayerMock {
  @observable isPlaying = false;
  @observable currentPlaylist = null;

  @computed
  get currentSong() {
    return this.currentPlaylist.currentSong;
  }

  @observable isLoading = null;
  @observable loadingError = null;

  async changePlaylist(playlistName) {}
  @action
  pause() {}
  @action
  play() {}
  async playNext() {}
}

const playerMock = new PlayerMock();
playerMock.isLoading = false;

const song1 = new SongMock();
song1.title = "Mock Title";
song1.album = "Mock Album";
song1.artist = "Mock Artist";
song1.rating = 60;
song1.playcount = 15;
song1.lastplayed = 1495156518;
song1.isMarkedAsPlayed = false;

const song2 = new SongMock();
song2.title = "Comatose";
song2.album = "010011001";
song2.artist = "Ayreon";
song2.rating = 90;
song2.playcount = 15;
song2.lastplayed = 1495156518;
song2.isMarkedAsPlayed = false;

const song3 = new SongMock();
song3.title = "Black & White";
song3.album = "Clayman";
song3.artist = "In Flames";
song3.rating = 100;
song3.playcount = 15;
song3.lastplayed = 1495156518;
song3.isMarkedAsPlayed = false;

const song4 = new SongMock();
song4.title = "What";
song4.album = "Who knows!";
song4.artist = "Asbestors";
song4.rating = 20;
song4.playcount = 15;
song4.lastplayed = 1495156518;
song4.isMarkedAsPlayed = false;

const currentPlaylist = new PlaylistMock();
currentPlaylist.name = "Mock playlist";
currentPlaylist.songs.push(song1);
currentPlaylist.songs.push(song2);
currentPlaylist.songs.push(song3);
currentPlaylist.songs.push(song4);

playerMock.currentPlaylist = currentPlaylist;

export default playerMock;
