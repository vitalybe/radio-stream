import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("playlist_collection_page");

import React, { Component } from "react";
import { StyleSheet, View, Image } from "react-native";
import { observer } from "mobx-react";

import player from "app/stores/player/player";
import { colors, fontSizes } from "app/styles/styles";
import navigator from "app/stores/navigator/navigator";
import NormalText from "app/shared_components/text/normal_text";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: "center",
    alignSelf: "stretch",
  },
  logo: {
    width: 90,
    height: 90,
    marginVertical: 20,
    resizeMode: "contain",
  },
  playlistButton: {
    width: 150,
    marginBottom: 10,
  },
  playlistText: {
    color: colors.SEMI_WHITE,
    fontSize: fontSizes.NORMAL,
  },
  settingsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});

@observer
export default class NoPlaylistSelectedPage extends Component {
  async onPlaylistClick(playlistName) {
    let logger = loggerCreator(this.onPlaylistClick.name, moduleLogger);
    logger.info(`${playlistName}`);

    await player.changePlaylist(playlistName);
    player.play();
    navigator.navigateToPlayer(playlistName);
  }

  render() {
    loggerCreator(this.render.name, moduleLogger);

    return (
      <View style={styles.container}>
        <Image source={require("app/images/logo.png")} style={styles.logo} />
        <NormalText>No playlist selected</NormalText>
      </View>
    );
  }
}
