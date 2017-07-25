import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("backend_metadata_api");

import chanceLib from "chance";
import moment from "moment";
import _ from "lodash";
import mockMp3 from "app/data/mock.mp3";

import sleep from "app/utils/sleep";

const chance = chanceLib.Chance();
const playlistResponse = ["Mock", "Heavy Mock", "Peacemock"];

class BackendMetadataApiMock {
  constructor() {
    this.lastId = 0;
  }

  _mockName() {
    return _.startCase(chance.sentence({ words: chance.integer({ min: 1, max: 3 }) }));
  }

  _createMockSong() {
    return {
      id: this.lastId++,
      title: this._mockName(),
      artist: this._mockName(),
      album: this._mockName(),
      rating: chance.integer({ min: 0, max: 5 }) * 20,
      playcount: chance.integer({ min: 0, max: 50 }),
      lastplayed: chance.integer({
        min: moment().unix() - 60 * 60 * 24 * 30 * 12,
        max: moment().unix(),
      }),
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
    return _.range(40).map(() => this._createMockSong());
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

  async querySongs(query) {
    await sleep(500);
    return _.range(40).map(() => this._createMockSong());
  }
}

export const backendMetadataApiMock = new BackendMetadataApiMock();
