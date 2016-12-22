import { observable, action } from "mobx";

import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("navigator");

export default class Navigator {

  ROUTE_PLAYLIST_COLLECTION_PAGE = 'PLAYLIST_COLLECTION_PAGE';
  ROUTE_SETTINGS_PAGE = 'SETTINGS_PAGE';
  ROUTE_PLAYER_PAGE = 'PLAYER_PAGE';

  @observable activeRoute = null;

  constructor() {
    this.navigateToPlaylistCollection();
  }

  _navigateTo(address, params) {
    this.activeRoute = observable(Object.assign({address: address}, params));
  }

  navigateToPlaylistCollection() {
    this._navigateTo(this.ROUTE_PLAYLIST_COLLECTION_PAGE);
  }

  navigateToPlayer(playlistName) {
    this._navigateTo(this.ROUTE_PLAYER_PAGE, {playlistName: playlistName});
  }

  navigateToSettings() {
    this._navigateTo(this.ROUTE_SETTINGS_PAGE);
  }
}