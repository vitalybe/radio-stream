import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator(__filename);

import {observable, action} from "mobx";
import retries from "../utils/retries"

import Playlist from "../domain/playlist"
import * as backendMetadataApi from '../utils/backend_metadata_api'

class PlaylistCollection {
  @observable items = [];

  @observable loading = false;
  @observable loadingAction = null;
  @observable loadingError = null;

  constructor() {
  }

  @action
  load() {
    let logger = loggerCreator(this.load.name, moduleLogger);
    logger.info(`start`);

    this.items.clear();
    this.loading = true;
    this.error = false;
    logger.info(`loading playlists`);

    return retries.promiseRetry(lastError => {
      this.loadingAction = "Loading playlists";
      this.loadingError = lastError && lastError.toString();

      return backendMetadataApi.playlists();
    }).then(action((playlists) => {
      logger.info(`got playlists: ${playlists}`);

      let newPlaylists = playlists.map(playlistName => {
        return new Playlist(playlistName);
      });

      this.items = observable(newPlaylists);
      this.loading = false;
    }));
  }

  async playlistByName(name) {
    await this.load();
    return this.items.find(playlist => playlist.name === name)
  }
}

export default new PlaylistCollection();