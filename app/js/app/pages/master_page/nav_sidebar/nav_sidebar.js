import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebar");

import React, { Component } from "react";
import { StyleSheet, View, Platform, Alert, TouchableOpacity } from "react-native";
import { observer } from "mobx-react";

import { masterStore } from "app/stores/master_store";
import NavSidebarMenuItem from "./nav_sidebar_menu_item";
import NavSidebarMenuTitle from "./nav_sidebar_menu_title";
import BackHandler from "app/utils/back_handler/back_handler";
import { player } from "app/stores/player/player";

import { playlistsStore } from "app/stores/playlists_store";
import { navigator } from "app/stores/navigator.js";
import Sidebar from "app/shared_components/sidebar";

import playIcon from "app/images/play.png";
import pencilIcon from "app/images/pencil-icon.png";
import musicIcon from "app/images/music.png";
import cogIcon from "app/images/cog.png";
import lookingGlassIcon from "app/images/looking-glass.png";
import NormalText from "app/shared_components/text/normal_text";
import BigText from "app/shared_components/text/big_text";

const WIDTH = 336;
const styles = StyleSheet.create({});

@observer
export default class NavSidebar extends Component {
  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    if (masterStore.isNavigationSidebarOpen) {
      Alert.alert("Radio Stream", "Do you want to exit?", [
        { text: "Cancel" },
        { text: "Exit", onPress: this.onExitPress },
      ]);
    } else {
      return false;
    }
  };

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
        onChangeOpen={this.onChangeOpen}
        enableScrubs={!masterStore.isPlaylistSidebarOpen}>
        <NavSidebarMenuTitle text="Radio Stream" />
        <NavSidebarMenuItem text="Player" leftImage={playIcon} onPress={this.onPlayerPress} />
        <NavSidebarMenuItem text="Search" leftImage={lookingGlassIcon} onPress={this.onSearchPress} />
        <NavSidebarMenuItem text="Settings" leftImage={cogIcon} onPress={this.onSettingsPress} />
        {Platform.OS !== "web"
          ? <NavSidebarMenuItem text="Exit" leftImage={playIcon} onPress={this.onExitPress} />
          : null}
        <NavSidebarMenuTitle text="Playlists" />
        {playlistsStore.playlists.map(playlist =>
          <NavSidebarMenuItem
            key={playlist.name}
            text={playlist.name}
            leftImage={musicIcon}
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
