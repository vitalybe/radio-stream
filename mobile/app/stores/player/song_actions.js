import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("SongActions");

import retries from "../../utils/retries";
import backendMetadataApi from "../../utils/backend_metadata_api";

export default class SongActions {
  constructor(song) {
    loggerCreator("constructor", moduleLogger);

    this.song = song;
    this.markingAsPlayedPromise = null;
  }

  async changeRating(newRating) {
    let logger = loggerCreator(this.changeRating.name, moduleLogger);
    logger.info(`start: ${newRating}`);

    await retries.promiseRetry(() => backendMetadataApi.updateRating(this.song.id, newRating));
    logger.info(`Success`);
    this.song.rating = newRating;
  }

  async markAsDeleted() {
    let logger = loggerCreator("delete", moduleLogger);

    logger.debug(`start: ${this.song.toString()}`);
    await retries.promiseRetry(() => backendMetadataApi.markAsDeleted(this.song.id));
    logger.debug(`complete: ${this.song.toString()}`);
  }
}
