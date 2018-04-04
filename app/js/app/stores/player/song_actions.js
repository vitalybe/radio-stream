import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("SongActions");

import retries from "app/utils/retries";
import { backendMetadataApiGetter } from "app/utils/backend_metadata_api/backend_metadata_api_getter";

export default class SongActions {
  constructor(song) {
    loggerCreator("constructor", moduleLogger);

    this.song = song;
    this.markingAsPlayedPromise = null;
  }

  async changeRating(newRating) {
    let logger = loggerCreator(this.changeRating.name, moduleLogger);
    logger.info(`start: ${newRating}`);

    await retries.promiseRetry(() => backendMetadataApiGetter.get().updateRating(this.song.id, newRating));
    logger.info(`Success`);
    this.song.rating = newRating;
  }

  async markAsDeleted() {
    let logger = loggerCreator("delete", moduleLogger);

    logger.debug(`start: ${this.song.toString()}`);
    await retries.promiseRetry(() => backendMetadataApiGetter.get().markAsDeleted(this.song.id));
    logger.debug(`complete: ${this.song.toString()}`);
  }
}
