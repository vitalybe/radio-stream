import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("playlist");

import { observable, computed } from "mobx";

export default class PlaylistMock {
  @observable name = null;
  @observable songs = [];
  @observable currentIndex = 0;

  @computed
  get currentSong() {
    return this.songs[this.currentIndex];
  }
}
