import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("song");

import {observable} from "mobx";

export default class Song {
  @observable id = null;
  @observable title = null;
  @observable artist = null;
  @observable album = null;
  @observable playcount = null;
  @observable lastplayed = null;
  @observable path = null;
  @observable rating = null;

  @observable isMarkedAsPlayed = false;
  markingAsPlayedPromise = null;

  @observable loadedSound = null;
  @observable loadedImageUrl = null;

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}