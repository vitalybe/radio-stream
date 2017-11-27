import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("MetadataContent");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import NormalText from "app/shared_components/text/normal_text";
import moment from "moment";
import contentStyle from "./content_style";

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  metadataInfo: {
    marginBottom: 5,
  },
});

@observer
export default class MetadataContent extends Component {
  render() {
    const song = this.props.song;

    return (
      <View style={[contentStyle.container, styles.container, this.props.style]}>
        <NormalText style={styles.metadataInfo}>Last played: {moment.unix(song.lastplayed).fromNow()}</NormalText>
        <NormalText style={styles.metadataInfo}>Play count: {song.playcount}</NormalText>
        <NormalText style={styles.metadataInfo}>Marked as played: {song.isMarkedAsPlayed ? "✔" : "x"}</NormalText>
      </View>
    );
  }
}

MetadataContent.propTypes = {
  song: React.PropTypes.object.isRequired,
};
