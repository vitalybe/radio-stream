import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlaylistSidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import { observer } from "mobx-react";

import masterStore from "app/stores/master_store";
import { colors } from "app/styles/styles";

import playlistImage from "app/images/playlist-white.png";
import BigText from "app/shared_components/text/big_text";
import SongsGrid from "app/shared_components/songs_grid/songs_grid";
import { dimensionsStoreInstance } from "app/stores/dimensions_store";
import player from "app/stores/player/player";

const BIG_WIDTH = 638;
const SMALL_WIDTH = 336;
const OPEN_RIGHT = -2;

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 54,
    bottom: -1,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopLeftRadius: 5,
    padding: 15,
  },
  playlistImage: {
    height: 33,
    width: 33,
    resizeMode: "contain",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  playlistName: {
    marginLeft: 10,
  },
});

@observer
export default class PlaylistSidebar extends Component {
  render() {
    loggerCreator(this.render.name, moduleLogger);

    const width = dimensionsStoreInstance.width > BIG_WIDTH ? BIG_WIDTH : SMALL_WIDTH;
    const closedRight = OPEN_RIGHT - width;
    const right = masterStore.isPlaylistSidebarOpen ? OPEN_RIGHT : closedRight;

    return (
      <ScrollView horizontal={false} style={[styles.sidebar, { width: width, right: right }]}>
        <View style={styles.header}>
          <Image source={playlistImage} style={styles.playlistImage} />
          <BigText style={styles.playlistName}>
            {player.currentPlaylist.name}
          </BigText>
        </View>
        {/* HACK - unusedWindowWidth is given only to force re-render of SongsGrid which doesn't happen on resize. In theory
         the render should've happened automatically, but it doesn't (I think it is React Fiber bug). The other
          alternative would be to listen to DimensionsEmitter in SongsGrid but that would only covert resizes that
          were triggered by Window resizing */}
        <SongsGrid unusedWindowWidth={width} playlist={player.currentPlaylist} />
      </ScrollView>
    );
  }
}

PlaylistSidebar.propTypes = {};
