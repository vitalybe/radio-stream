import loggerCreator from '../../utils/logger'
const moduleLogger = loggerCreator("player_mock");

import { observable, action } from "mobx";

import SongMock from './mock/song_mock'

class PlayerMock {

  @observable isPlaying = false;
  @observable currentPlaylist = null;
  @observable song = null;

  @observable isLoading = null;
  @observable loadingAction = null;
  @observable loadingError = null;

  async changePlaylist(playlistName) {}
  @action pause() {}
  @action play() {}
  async playNext() {}
}

const playerMock = new PlayerMock();
playerMock.isLoading = false
playerMock.song = new SongMock()
playerMock.song.title = "Mock title"
playerMock.song.artist = "Mock title"
playerMock.song.rating = 60;

export default playerMock;