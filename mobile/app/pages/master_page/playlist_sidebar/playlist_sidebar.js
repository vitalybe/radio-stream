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

const WIDTH = 638;
const OPEN_RIGHT = -2;
const CLOSED_RIGHT = OPEN_RIGHT - WIDTH;

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

    const right = masterStore.isPlaylistSidebarOpen ? OPEN_RIGHT : CLOSED_RIGHT;

    return (
      <ScrollView horizontal={false} style={[styles.sidebar, { right: right }]}>
        <View style={styles.header}>
          <Image source={playlistImage} style={styles.playlistImage} />
          <BigText style={styles.playlistName}>Peaceful</BigText>
        </View>
        <SongsGrid />
      </ScrollView>
    );
  }
}

PlaylistSidebar.propTypes = {};
