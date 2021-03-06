import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlaylistSidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import { observer } from "mobx-react";

import { masterStore } from "app/stores/master_store";
import { colors } from "app/styles/styles";

import playlistImage from "app/images/playlist-white.png";
import BigText from "app/shared_components/text/big_text";
import SongsGrid from "app/shared_components/songs_grid/songs_grid";
import { dimensionsStore } from "app/stores/dimensions_store";
import { player } from "app/stores/player/player";
import Sidebar from "app/shared_components/sidebar";

const BIG_WIDTH = 900;
const SMALL_WIDTH = 336;

const styles = StyleSheet.create({
  container: {},
  playlistImage: {
    height: 33,
    width: 33,
    resizeMode: "contain",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    marginBottom: 0,
  },
  playlistName: {
    marginLeft: 10,
  },
  songGrid: {
    margin: 10,
  },
});

@observer
export default class PlaylistSidebar extends Component {
  onChangeOpen = isOpen => {
    masterStore.isPlaylistSidebarOpen = isOpen;
  };

  onSongRowPress = pressedSong => {
    const logger = loggerCreator("onSongRowPress", moduleLogger);
    logger.info(`pressed song: ${pressedSong.toString()}`);
    masterStore.isPlaylistSidebarOpen = false;
    let foundIndex = player.currentPlaylist.songs.findIndex(song => pressedSong.id === song.id);
    logger.info(`song index in playlist: ${foundIndex}`);
    if (foundIndex > -1) {
      player.playIndex(foundIndex);
    } else {
      logger.error("pressed song not found in playlist");
    }
  };

  render() {
    loggerCreator(this.render.name, moduleLogger);

    const width = dimensionsStore.width > BIG_WIDTH ? BIG_WIDTH : SMALL_WIDTH;

    return (
      <Sidebar
        width={width}
        fromLeft={false}
        isOpen={masterStore.isPlaylistSidebarOpen}
        onChangeOpen={this.onChangeOpen}
        enableScrubs={!masterStore.isNavigationSidebarOpen}>
        <ScrollView horizontal={false} style={[styles.container]}>
          <View style={styles.header}>
            <Image source={playlistImage} style={styles.playlistImage} />
            <BigText style={styles.playlistName}>{player.currentPlaylist.name}</BigText>
          </View>
          <SongsGrid
            style={styles.songGrid}
            songs={player.currentPlaylist.songs.toJS()}
            highlightedSong={player.currentSong}
            visibleRows={Platform.OS === "web" ? 13 : 7}
            onRowPress={this.onSongRowPress}
          />
        </ScrollView>
      </Sidebar>
    );
  }
}

PlaylistSidebar.propTypes = {};
