import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("backend_metadata_api");

import sleep from "app/utils/sleep";

const playlistResponse = ["Mock", "Heavy Mock", "Peacemock"];

class BackendMetadataApiMock {
  async testConnection(host, password) {
    let logger = loggerCreator("testConnection", moduleLogger);
    logger.info(`host: ${host}`);

    await sleep(500);
    return playlistResponse;
  }

  async playlists() {
    await sleep(500);
    return playlistResponse;
  }

  async playlistSongs(playlistName) {
    await sleep(500);
    // TODO
    return null;
  }

  async updateRating(songId, newRating) {
    await sleep(500);
    return null;
  }

  async updateLastPlayed(songId) {
    await sleep(500);
    return null;
  }

  async markAsDeleted(songId) {
    await sleep(500);
    return null;
  }
}

export const backendMetadataApiMock = new BackendMetadataApiMock();
