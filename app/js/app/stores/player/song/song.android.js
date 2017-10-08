import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("song");

import { observable, computed } from "mobx";

import { getArtistImage } from "app/utils/backend_lastfm_api";
import SongActions from "../song_actions";

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
  @observable _loadedImageUrl = null;

  @computed
  get loadedImageUrl() {
    const logger = loggerCreator("loadedImageUrl", moduleLogger);

    if (this._loadedImageUrl) {
      logger.info(`returning an existing image`);
      return this._loadedImageUrl;
    } else {
      logger.info(`image isn't loaded - loading...`);
      getArtistImage(this.artist).then(imageUri => {
        logger.info(`got album art uri: ${imageUri}`);
        this._loadedImageUrl = imageUri;
      });
    }
  }

  constructor({ id, artist, title, album, rating, playcount, lastplayed, isMarkedAsPlayed }) {
    loggerCreator("constructor", moduleLogger);

    this.id = id;
    this.artist = artist;
    this.title = title;
    this.album = album;
    this.rating = rating;
    this.playcount = playcount;
    this.lastplayed = lastplayed;
    this.isMarkedAsPlayed = isMarkedAsPlayed;
    this._loadedImageUrl = null;
    this.actions = new SongActions(this);
  }

  toString() {
    return `Song[Artist=${this.artist} Title=${this.title}]`;
  }
}
