import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongDetails");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "app/shared_components/text/normal_text";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  nameText: {
    marginBottom: 5,
  },
  artistText: {
    fontWeight: "bold",
  },
});

@observer
export default class SongDetails extends Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <NormalText style={[styles.nameText]}>{`${this.props.song.title}`}</NormalText>
        <NormalText style={[styles.nameText, styles.artistText]}>{`${this.props.song.artist}`}</NormalText>
        <NormalText style={[styles.nameText]}>{`${this.props.song.album}`}</NormalText>
      </View>
    );
  }
}

SongDetails.propTypes = {
  song: React.PropTypes.object.isRequired,
};
