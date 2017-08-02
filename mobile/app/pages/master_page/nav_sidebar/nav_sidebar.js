import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebar");

import React, { Component } from "react";
import { StyleSheet, View, Platform, Animated, PanResponder } from "react-native";
import { autorun } from "mobx";
import { observer } from "mobx-react";

import { masterStore } from "app/stores/master_store";
import { colors } from "app/styles/styles";
import NavSidebarMenuItem from "./nav_sidebar_menu_item";
import NavSidebarMenuTitle from "./nav_sidebar_menu_title";
import BackHandler from "app/utils/back_handler/back_handler";
import { player } from "app/stores/player/player";

import playIcon from "app/images/play.png";
import pencilIcon from "app/images/pencil-icon.png";
import { playlistsStore } from "app/stores/playlists_store";
import { navigator } from "app/stores/navigator.js";

const WIDTH = 336;
const OPEN_LEFT = -2;
const CLOSED_LEFT = OPEN_LEFT - WIDTH;

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 54,
    bottom: -1,
    width: WIDTH,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopRightRadius: 5,
  },
});

@observer
export default class NavSidebar extends Component {
  componentWillMount() {
    this.state = {
      leftAnimation: new Animated.Value(masterStore.isNavigationSidebarOpen ? OPEN_LEFT : CLOSED_LEFT),
    };

    this.autorunDisposer = autorun(() => {
      const logger = loggerCreator("autorun", moduleLogger);
      logger.info(`new value of isNavigationSidebarOpen: ${masterStore.isNavigationSidebarOpen}`);
      this.toggleSidebar(masterStore.isNavigationSidebarOpen);
    });

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        loggerCreator("onMoveShouldSetPanResponder", moduleLogger);
        return gestureState.numberActiveTouches > 0 && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        loggerCreator("onPanResponderGrant", moduleLogger);
        this.state.leftAnimation.setOffset(this.state.leftAnimation._value);
        this.state.leftAnimation.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dx: this.state.leftAnimation }]),
      onPanResponderRelease: (evt, gestureState) => {
        loggerCreator("onPanResponderRelease", moduleLogger);

        this.state.leftAnimation.flattenOffset();
        masterStore.isNavigationSidebarOpen = gestureState.vx > 0;
      },
    });
  }

  componentWillUnmount() {
    this.autorunDisposer();
  }

  toggleSidebar(isOpen) {
    Animated.timing(this.state.leftAnimation, {
      toValue: isOpen ? OPEN_LEFT : CLOSED_LEFT,
      duration: 200,
    }).start();
  }

  onPlaylistPress = async playlistName => {
    await player.changePlaylist(playlistName);
    player.play();
    navigator.navigateToPlayer();
    masterStore.closeSidebars();
  };

  onPlaylistEditPress = playlist => {
    masterStore.closeSidebars();
    navigator.navigateToSearch(playlist.query, playlist.name);
  };

  onPlayerPress = () => {
    masterStore.closeSidebars();
    navigator.navigateToPlayer();
  };

  onSearchPress = () => {
    masterStore.closeSidebars();
    navigator.navigateToSearch();
  };

  onSettingsPress = () => {
    masterStore.closeSidebars();
    navigator.navigateToSettings();
  };

  onExitPress = () => {
    loggerCreator("onExitPress", moduleLogger);

    player.stop();
    BackHandler.exitApp();
  };

  render() {
    loggerCreator(this.render.name, moduleLogger);

    return (
      <Animated.View
        style={[
          styles.sidebar,
          {
            left: this.state.leftAnimation.interpolate({
              inputRange: [CLOSED_LEFT, OPEN_LEFT],
              outputRange: [CLOSED_LEFT, OPEN_LEFT],
              extrapolate: "clamp",
            }),
          },
        ]}
        {...this.panResponder.panHandlers}>
        <NavSidebarMenuTitle text="Radio Stream" />
        <NavSidebarMenuItem text="Player" leftImage={playIcon} onPress={this.onPlayerPress} />
        <NavSidebarMenuItem text="Search" leftImage={playIcon} onPress={this.onSearchPress} />
        <NavSidebarMenuItem text="Settings" leftImage={playIcon} onPress={this.onSettingsPress} />
        {Platform.OS !== "web"
          ? <NavSidebarMenuItem text="Exit" leftImage={playIcon} onPress={this.onExitPress} />
          : null}
        <NavSidebarMenuTitle text="Playlists" />
        {playlistsStore.playlists.map(playlist =>
          <NavSidebarMenuItem
            key={playlist.name}
            text={playlist.name}
            leftImage={playIcon}
            rightImage={pencilIcon}
            onPress={() => this.onPlaylistPress(playlist.name)}
            onRightImagePress={() => this.onPlaylistEditPress(playlist)}
          />
        )}
      </Animated.View>
    );
  }
}

NavSidebar.propTypes = {};
