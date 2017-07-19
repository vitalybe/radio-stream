import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("PlayerLoadingSpinner");

import React, { Component } from "react";
import { Image, StyleSheet, View, ActivityIndicator } from "react-native";

import NormalText from "app/shared_components/text/normal_text";
import { player } from "app/stores/player/player";
import SongDetails from "app/pages/player_page/song_details";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Progress
  progressSpinner: {
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  progressStatus: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  progressStatusError: {
    color: "red",
  },
});

export default class PlayerLoadingSpinner extends Component {
  render() {
    loggerCreator("render", moduleLogger);

    const song = this.props.song;

    let loadingError = "";
    if (player.loadingError) {
      loadingError = `Error occurred, retrying: ${player.loadingError}`;
    }

    return (
      <View style={styles.container}>
        <View style={styles.progressSpinner}>
          <ActivityIndicator size="large" />
        </View>
        <View style={styles.progressStatus}>
          {song ? <SongDetails song={song} style={styles.songDetails} /> : null}
          <NormalText style={styles.progressStatusError}>
            {loadingError}
          </NormalText>
        </View>
      </View>
    );
  }
}

PlayerLoadingSpinner.propTypes = {
  song: React.PropTypes.object,
};
