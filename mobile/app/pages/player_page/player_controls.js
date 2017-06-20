import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlayerControls");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import Icon from "../../shared_components/icon";
import CircleButton from "../../shared_components/circle_button";
import { colors } from "../../styles/styles";
import player from "../../stores/player/player";

const styles = StyleSheet.create({
  controlsView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 80, // Causes the play button to be in the center
  },
  controlButtonText: {
    color: colors.SEMI_WHITE,
    fontSize: 40,
  },
  controlTextPlay: {
    paddingLeft: 10,
  },
  controlTextPause: {
    paddingLeft: 0,
  },
  controlButtonPlay: {
    marginRight: 20,
  },
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
        <CircleButton size={100} onPress={() => this.onPressPlayPause()} style={[styles.controlButtonPlay]}>
          <Icon
            name={player.isPlaying ? "pause" : "play"}
            style={[styles.controlButtonText, player.isPlaying ? styles.controlTextPause : styles.controlTextPlay]}
          />
        </CircleButton>
        <CircleButton size={60} onPress={() => this.onPressNext()}>
          <Icon name="step-forward" style={styles.controlButtonText} />
        </CircleButton>
      </View>
    );
  }
}
