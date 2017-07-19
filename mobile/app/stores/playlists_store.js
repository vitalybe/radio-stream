import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("PlaylistsStore");

import { observable } from "mobx";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";

class PlaylistsStore {
  @observable playlistNames = [];

  async updatePlaylists() {
    const logger = loggerCreator("updatePlaylists", moduleLogger);
    let result = await backendMetadataApi.playlists();
    logger.info(`got results: ${result}`);
    this.playlistNames = result;
  }
}

export const playlistsStore = new PlaylistsStore();
