import loggerCreator from "../../utils/logger";
const moduleLogger = loggerCreator("navigator_real");

import { observable } from "mobx";

import constants from "../../utils/constants";

class Navigator {
  @observable activeRoute = null;

  constructor() {
    this.navigateToPlaylistCollection();
  }

  _navigateTo(address, params) {
    let logger = loggerCreator("_navigateTo", moduleLogger);
    logger.info(`${address}`);
    this.activeRoute = observable(Object.assign({ address: address }, params));
  }

  navigateToPlaylistCollection() {
    loggerCreator("navigateToPlaylistCollection", moduleLogger);
    this._navigateTo(constants.ROUTE_PLAYLIST_COLLECTION_PAGE);
  }

  navigateToPlayer(playlistName) {
    loggerCreator("navigateToPlayer", moduleLogger);
    this._navigateTo(constants.ROUTE_PLAYER_PAGE, { playlistName: playlistName });
  }

  navigateToSettings() {
    loggerCreator("navigateToSettings", moduleLogger);
    this._navigateTo(constants.ROUTE_SETTINGS_PAGE);
  }
}

export default new Navigator();
