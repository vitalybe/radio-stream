import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("navigator_mock");

import { observable } from "mobx";

import constants from "app/utils/constants";
import navigatorReal from "./navigator_real";

class NavigatorMock {
  @observable activeRoute = null;

  navigateToPlaylistCollection() {}
  navigateToPlayer(playlistName) {}
  navigateToSettings() {}
}

const navigatorMock = new NavigatorMock();
navigatorMock.activeRoute = { address: constants.ROUTE_PLAYER_PAGE, playlistName: "Mock Playlist" };

export default navigatorMock;
