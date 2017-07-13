import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("player_mock");

import { observable, action } from "mobx";

import SongMock from "./mock/song_mock";
import PlaylistMock from "app/stores/player/mock/playlist_mock";

class PlayerMock {
  @observable isPlaying = false;
  @observable currentPlaylist = null;
  @observable song = null;

  @observable isLoading = null;
  @observable loadingAction = null;
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

const song = new SongMock();
song.title = "Mock Title";
song.album = "Mock Album";
song.artist = "Mock Artist";
song.rating = 60;
song.playcount = 15;
song.lastplayed = 1495156518;
song.isMarkedAsPlayed = false;

const currentPlaylist = new PlaylistMock();
currentPlaylist.name = "Mock playlist";
currentPlaylist.songs.push(song);

playerMock.song = song;
playerMock.currentPlaylist = currentPlaylist;

export default playerMock;
