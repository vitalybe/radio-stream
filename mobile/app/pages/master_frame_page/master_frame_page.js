import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterFramePage");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, TouchableHighlight } from "react-native";
import { observer } from "mobx-react";

import { MenuContext } from "../../shared_components/context_menu/context_menu";
import Sidebar from "./sidebar";
import constants from "../../utils/constants";
import navigator from "../../stores/navigator/navigator";
import masterFrame from "../../stores/master_frame";

import PlaylistCollectionPage from "../../pages/playlist_collection_page";
import PlayerPage from "../../pages/player_page/player_page";
import SettingsPage from "../../pages/settings/settings_page";

import backgroundImage from "../../images/background.jpg";
import hamburgerImage from "../../images/hamburger.png";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignSelf: "stretch",
  },
  menuContext: {
    flex: 1,
    alignSelf: "stretch",
  },
});

@observer
export default class MasterFramePage extends Component {
  componentWillMount() {
    loggerCreator("componentWillMount", moduleLogger);
  }

  onHamburgerClick = () => {
    let logger = loggerCreator("onHamburgerClick", moduleLogger);

    masterFrame.isNavigationSidebarOpen = !masterFrame.isNavigationSidebarOpen;
    logger.info(`navigation sidebar should be now open? ${masterFrame.isNavigationSidebarOpen}`);
  };

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`activate route: ${navigator.activeRoute}`);

    let page = null;
    let activeRoute = navigator.activeRoute;

    if (activeRoute) {
      switch (activeRoute.address) {
        case constants.ROUTE_PLAYLIST_COLLECTION_PAGE:
          page = <PlaylistCollectionPage />;
          break;
        case constants.ROUTE_PLAYER_PAGE:
          page = <PlayerPage playlistName={activeRoute.playlistName} />;
          break;
        case constants.ROUTE_SETTINGS_PAGE:
          page = <SettingsPage />;
          break;
        default:
          throw new Error("unexpected route");
      }
    }

    return (
      <Image source={backgroundImage} resizeMode="cover" style={styles.container}>
        <MenuContext customStyles={{ menuContextWrapper: styles.menuContext }}>
          <TouchableHighlight onPress={this.onHamburgerClick}>
            <Image source={hamburgerImage} height={34} width={34} />
          </TouchableHighlight>
          {page}
        </MenuContext>
        <Sidebar />
      </Image>
    );
  }
}

MasterFramePage.propTypes = {};
