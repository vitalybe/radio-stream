import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("LoadingSpinner");

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

export default class LoadingSpinner extends Component {
  render() {
    loggerCreator("render", moduleLogger);

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
          {this.props.message
            ? <NormalText>
                {this.props.message}
              </NormalText>
            : null}
          {this.props.song ? <SongDetails song={this.props.song} style={styles.songDetails} /> : null}
          <NormalText style={styles.progressStatusError}>
            {loadingError}
          </NormalText>
        </View>
      </View>
    );
  }
}

LoadingSpinner.propTypes = {
  message: React.PropTypes.string,
  song: React.PropTypes.object,
};
