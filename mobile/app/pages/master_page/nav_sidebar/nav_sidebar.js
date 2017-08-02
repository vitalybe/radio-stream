import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebar");

import React, { Component } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { observer } from "mobx-react";

import { masterStore } from "app/stores/master_store";
import NavSidebarMenuItem from "./nav_sidebar_menu_item";
import NavSidebarMenuTitle from "./nav_sidebar_menu_title";
import BackHandler from "app/utils/back_handler/back_handler";
import { player } from "app/stores/player/player";

import playIcon from "app/images/play.png";
import pencilIcon from "app/images/pencil-icon.png";
import { playlistsStore } from "app/stores/playlists_store";
import { navigator } from "app/stores/navigator.js";
import Sidebar from "app/shared_components/sidebar";

const WIDTH = 336;
const styles = StyleSheet.create({});

@observer
export default class NavSidebar extends Component {
  componentWillMount() {}

  onPlaylistPress = async playlistName => {
    await player.changePlaylist(playlistName);
    player.play();
    navigator.navigateToPlayer();
  };

  onPlaylistEditPress = playlist => {
    navigator.navigateToSearch(playlist.query, playlist.name);
  };

  onPlayerPress = () => {
    navigator.navigateToPlayer();
  };

  onSearchPress = () => {
    navigator.navigateToSearch();
  };

  onSettingsPress = () => {
    navigator.navigateToSettings();
  };

  onExitPress = () => {
    loggerCreator("onExitPress", moduleLogger);

    player.stop();
    BackHandler.exitApp();
  };

  onChangeOpen = isOpen => {
    masterStore.isNavigationSidebarOpen = isOpen;
  };

  render() {
    loggerCreator(this.render.name, moduleLogger);

    return (
      <Sidebar
        width={WIDTH}
        fromLeft={true}
        isOpen={masterStore.isNavigationSidebarOpen}
        onChangeOpen={this.onChangeOpen}>
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
      </Sidebar>
    );
  }
}

NavSidebar.propTypes = {};
