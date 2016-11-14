import { observable, action } from "mobx";

import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("navigator");

class Navigator {
  @observable activeRoute = routes.PLAYLIST_COLLECTION_PAGE;

  navigateTo(route) {
    if(route in routes == false) {
      throw new Error(`invalid route ${route}`)
    }

    this.activeRoute = route;
  }
}

export const routes = {
  PLAYLIST_COLLECTION_PAGE: 'PLAYLIST_COLLECTION_PAGE',
  SETTINGS_PAGE: 'SETTINGS_PAGE',
  PLAYER_PAGE: 'PLAYER_PAGE',
};

export const navigator = new Navigator();