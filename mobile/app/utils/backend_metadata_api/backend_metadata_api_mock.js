import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("backend_metadata_api");

import mockMp3 from "app/data/mock.mp3";

import sleep from "app/utils/sleep";

const playlistResponse = ["Mock", "Heavy Mock", "Peacemock"];

class BackendMetadataApiMock {
  constructor() {
    this.lastId = 0;
  }

  _createMockSong({ title, artist, album, rating }) {
    return {
      id: this.lastId++,
      title,
      artist,
      album,
      rating: rating,
      path: mockMp3,
    };
  }

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
    return [
      this._createMockSong({ title: "title", album: "album", artist: "artist", rating: 80 }),
      this._createMockSong({ title: "title", album: "album", artist: "artist", rating: 80 }),
      this._createMockSong({ title: "title", album: "album", artist: "artist", rating: 80 }),
    ];
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
