import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("PlaylistsStore");

import { observable } from "mobx";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";

class PlaylistsStore {
  @observable playlists = [];

  async updatePlaylists() {
    const logger = loggerCreator("updatePlaylists", moduleLogger);
    let result = await backendMetadataApi.playlists();
    logger.info(`got results: ${result}`);
    this.playlists = result;
  }
}

export const playlistsStore = new PlaylistsStore();
