import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("MasterPage");

import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";

import { MenuContext } from "app/shared_components/context_menu/context_menu";
import NavSidebar from "./nav_sidebar/nav_sidebar";
import { routes } from "app/utils/routes";
import { navigator } from "app/stores/navigator.js";
import settings from "app/utils/settings/settings";
import settingsNative from "app/utils/settings/settings_native";
import BackHandler from "app/utils/back_handler/back_handler";

import PlayerPage from "app/pages/player_page/player_page";
import SettingsPage from "app/pages/settings/settings_page";

import backgroundImage from "app/images/background.jpg";
import Topbar from "./topbar";
import PlaylistSidebar from "app/pages/master_page/playlist_sidebar/playlist_sidebar";
import { player } from "app/stores/player/player";
import { playlistsStore } from "app/stores/playlists_store";
import { masterStore } from "app/stores/master_store";
import SearchPage from "app/pages/search_page/search_page";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignSelf: "stretch",
    resizeMode: "cover",
    overflow: "hidden",
  },
  menuContext: { flex: 1, alignSelf: "stretch" },
  sidebarCurtain: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "transparent",
  },
});

@observer
export default class MasterPage extends Component {
  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);

    this.state = {
      ready: false,
    };

    logger.info(`loading settings`);
    await settings.load();
    await settingsNative.load();

    logger.info(`is host configured?`);
    if (settings.host) {
      logger.info(`updated status. playing? ${player.isPlaying}`);
      if (player.isPlaying) {
        logger.info(`player currently playing - navigating to player`);
        navigator.navigateToPlayer();
      }
      logger.info(`loading playlists`);
      playlistsStore.updatePlaylists().then(() => {
        logger.info(`finishing loading playlists`);
      });
    } else {
      logger.info(`host not found in settings - showing settings page`);
      navigator.navigateToSettings();
      masterStore.closeSidebars();
    }

    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);

    logger.info(`initialization finished`);
    this.setState({ ready: true });
  }

  onBackPress() {
    masterStore.isNavigationSidebarOpen = true;
    return true;
  }

  onSidebarCurtainPress = () => {
    masterStore.closeSidebars();
  };

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`activate route: ${navigator.activeRoute}`);

    let page = null;
    let activeRoute = navigator.activeRoute;

    if (activeRoute) {
      switch (activeRoute.address) {
        case routes.PLAYER_PAGE:
          page = <PlayerPage {...activeRoute} />;
          break;
        case routes.SETTINGS_PAGE:
          page = <SettingsPage {...activeRoute} />;
          break;
        case routes.SEARCH_PAGE:
          page = <SearchPage {...activeRoute} />;
          break;
        default:
          throw new Error("unexpected route");
      }
    }

    if (this.state.ready) {
      const isAnySidebarOpen = masterStore.isPlaylistSidebarOpen || masterStore.isNavigationSidebarOpen;
      const sidebarCurtains = (
        <View style={styles.sidebarCurtain} onStartShouldSetResponder={this.onSidebarCurtainPress} />
      );

      return (
        <Image source={backgroundImage} style={styles.container}>
          <MenuContext customStyles={{ menuContextWrapper: styles.menuContext }}>
            <Topbar />
            {page}
          </MenuContext>
          {isAnySidebarOpen ? sidebarCurtains : null}
          <NavSidebar />
          {player.currentPlaylist ? <PlaylistSidebar /> : null}
        </Image>
      );
    } else {
      return null;
    }
  }
}

MasterPage.propTypes = {};
