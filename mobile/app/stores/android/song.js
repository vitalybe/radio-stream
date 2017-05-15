import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("song");

import {observable} from "mobx";

export default class Song {
  id = null;
  title = null;
  artist = null;
  album = null;
  playcount = null;
  lastplayed = null;
  path = null;
  @observable rating = null;

  @observable isMarkedAsPlayed = false;
  markingAsPlayedPromise = null;

  @observable loadedSound = null;
  @observable loadedImageUrl = null;

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}