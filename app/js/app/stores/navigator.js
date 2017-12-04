import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("navigator");

import { observable } from "mobx";

import { routes } from "app/utils/routes";

class Navigator {
  @observable activeRoute = null;

  constructor() {
    this.navigateToSettings();
  }

  _navigateTo(address, params) {
    let logger = loggerCreator("_navigateTo", moduleLogger);
    logger.info(`${address}`);
    this.activeRoute = Object.assign({ address: address }, params);
  }

  navigateToPlayer() {
    loggerCreator("navigateToPlayer", moduleLogger);
    this._navigateTo(routes.PLAYER_PAGE);
  }

  navigateToSettings() {
    loggerCreator("navigateToSettings", moduleLogger);
    this._navigateTo(routes.SETTINGS_PAGE);
  }

  navigateToSearch(query, playlistName) {
    const logger = loggerCreator("navigateToSearch", moduleLogger);
    logger.info(`playlistName: ${playlistName} query: ${query}`);
    this._navigateTo(routes.SEARCH_PAGE, { playlistName, initialQuery: query });
  }
}

export const navigator = new Navigator();
