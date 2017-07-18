import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("song");

import { observable } from "mobx";

let lastId = 0;

export default class SongMock {
  @observable id = null;
  @observable title = null;
  @observable artist = null;
  @observable album = null;
  @observable playcount = null;
  @observable lastplayed = null;
  @observable path = null;
  @observable rating = null;

  @observable isMarkedAsPlayed = false;

  @observable loadedSound = null;
  @observable loadedImageUrl = null;

  constructor() {
    this.id = lastId;
    lastId++;
  }

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}
