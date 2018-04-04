import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlayerControls");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import Icon from "app/shared_components/icon";
import CircleButton from "app/shared_components/circle_button";
import { colors } from "app/styles/styles";
import { player } from "app/stores/player/player";

import playImage from "app/images/play.png";
import nextImage from "app/images/next.png";
import pauseImage from "app/images/pause.png";

const styles = StyleSheet.create({
  controlsView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 80, // Causes the play button to be in the center
    marginBottom: 10,
  },
  controlButtonText: {
    color: colors.CYAN_BRIGHT,
    fontSize: 40,
  },
  controlImagePlay: { width: 54, height: 54, position: "relative", left: 5 },
  controlImagePause: { width: 45, height: 45 },
  controlButtonPlay: {
    marginRight: 20,
  },
  controlImageNext: { width: 28, height: 28 },
});

@observer
export default class PlayerControls extends Component {
  onPressPlayPause() {
    loggerCreator("onPressPlayPause", moduleLogger);

    player.playPauseToggle();
  }

  onPressNext() {
    player.playNext();
  }

  render() {
    return (
      <View style={styles.controlsView}>
        <CircleButton size={90} onPress={() => this.onPressPlayPause()} style={[styles.controlButtonPlay]}>
          {player.isPlaying === false
            ? <Image source={playImage} style={styles.controlImagePlay} resizeMode={"contain"} />
            : <Image source={pauseImage} style={styles.controlImagePause} resizeMode={"contain"} />}
        </CircleButton>
        <CircleButton size={60} onPress={() => this.onPressNext()}>
          <Image source={nextImage} style={styles.controlImageNext} resizeMode={"contain"} />
        </CircleButton>
      </View>
    );
  }
}
