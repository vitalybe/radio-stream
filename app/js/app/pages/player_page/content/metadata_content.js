import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("MetadataContent");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import NormalText from "app/shared_components/text/normal_text";
import BigText from "app/shared_components/text/big_text";
import moment from "moment";
import contentStyle from "./content_style";

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    marginBottom: 15,
  },
  line: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  value: {
    fontWeight: "normal",
  },
});

@observer
export default class MetadataContent extends Component {
  render() {
    const song = this.props.song;

    return (
      <View style={[contentStyle.container, styles.container, this.props.style]}>
        <BigText style={styles.header}>Metadata</BigText>
        <NormalText style={styles.line}>
          Last played: <NormalText style={styles.value}>{moment.unix(song.lastplayed).fromNow()}</NormalText>
        </NormalText>
        <NormalText style={styles.line}>
          Play count: <NormalText style={styles.value}>{song.playcount}</NormalText>
        </NormalText>
        <NormalText style={styles.line}>
          Marked as played: <NormalText style={styles.value}>{song.isMarkedAsPlayed ? "✔" : "x"}</NormalText>
        </NormalText>
      </View>
    );
  }
}

MetadataContent.propTypes = {
  song: React.PropTypes.object.isRequired,
};
