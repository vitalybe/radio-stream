import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("playlist_collection_page");

import React, { Component } from "react";
import { StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import BackHandler from "app/utils/back_handler/back_handler";
import { observer } from "mobx-react";

import player from "app/stores/player/player";
import { colors, fontSizes } from "app/styles/styles";
import Button from "app/shared_components/rectangle_button";
import navigator from "app/stores/navigator/navigator";
import backendMetadataApi from "app/utils/backend_metadata_api";
import settings from "app/utils/settings/settings";

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
export default class PlaylistCollectionPage extends Component {
  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);

    this.state = {};
    BackHandler.addEventListener("hardwareBackPress", () => this.onPressHardwareBack());

    logger.info(`fetching persisted settings`);
    if (settings.host) {
      logger.info(`updated status. playing? ${player.isPlaying}`);
      if (player.isPlaying) {
        logger.info(`player currently playing - navigating to player`);
        navigator.navigateToPlayer(player.currentPlaylist.name);
      } else {
        logger.info(`proceed as usual - fetching playlists`);
        this.fetchPlaylists();
      }
    } else {
      logger.info(`host not found in settings - showing settings page`);
      navigator.navigateToSettings();
    }
  }

  async fetchPlaylists() {
    let logger = loggerCreator("fetchPlaylists", moduleLogger);

    try {
      let result = await backendMetadataApi.playlists();
      logger.info(`got results: ${result}`);
      this.setState({ playlists: result });
    } catch (err) {
      logger.error(`failed to get playlists`);
    }
  }

  onPressHardwareBack() {
    let logger = loggerCreator("onPressHardwareBack", moduleLogger);
    player.stopPlayer();

    BackHandler.exitApp();
    return true;
  }

  async onPlaylistClick(playlistName) {
    let logger = loggerCreator(this.onPlaylistClick.name, moduleLogger);
    logger.info(`${playlistName}`);

    await player.changePlaylist(playlistName);
    player.play();
    navigator.navigateToPlayer(playlistName);
  }

  onSettingsClick() {
    navigator.navigateToSettings();
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    return (
      <View style={styles.container}>
        <Image source={require("app/images/logo.png")} style={styles.logo} />

        <Choose>
          <When condition={this.state.playlists}>
            {this.state.playlists.map(playlist => {
              return (
                <Button
                  key={playlist}
                  style={styles.playlistButton}
                  className="playlist"
                  onPress={() => this.onPlaylistClick(playlist)}>
                  <Text style={styles.playlistText}>
                    {playlist}
                  </Text>
                </Button>
              );
            })}
          </When>
          <Otherwise>
            <ActivityIndicator />
          </Otherwise>
        </Choose>
        <Button style={styles.settingsButton} onPress={() => this.onSettingsClick()}>
          <Image style={styles.settingsIcon} source={require("app/images/settings.png")} />
        </Button>
      </View>
    );
  }
}
