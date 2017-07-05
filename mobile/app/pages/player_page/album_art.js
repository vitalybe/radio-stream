import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("AlbumArt");

import React, { Component } from "react";
import { Image, StyleSheet, View, Dimensions } from "react-native";
import { observer } from "mobx-react";

import FlipCard from "app/utils/flip_card";
import NormalText from "app/shared_components/text/normal_text";
import moment from "moment";
import { colors, fontSizes } from "app/styles/styles";

let artSize = 260;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK,
    borderWidth: 2,

    position: "relative",
    alignSelf: "center",
  },
  albumArt: {
    resizeMode: "contain",

    width: artSize,
    height: artSize,
  },
  flippedAlbumArt: {
    width: artSize,
    height: artSize,
    padding: 10,
  },
  additionalSongInfo: {
    marginBottom: 5,
  },
});

@observer
export default class AlbumArt extends Component {
  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    const song = this.props.song;

    let albumArt = require("app/images/no-album.png");
    if (song.loadedImageUrl) {
      logger.info(`uri: ${song.loadedImageUrl}`);
      albumArt = { uri: song.loadedImageUrl };
    }

    return (
      <View style={this.props.style}>
        <FlipCard
          style={styles.container}
          flipHorizontal={true}
          flipVertical={false}
          alignHeight={true}
          alignWidth={true}>
          <View>
            <Image style={styles.albumArt} source={albumArt} />
          </View>
          <View style={styles.flippedAlbumArt}>
            <NormalText style={styles.additionalSongInfo}>
              Last played: {moment.unix(song.lastplayed).fromNow()}
            </NormalText>
            <NormalText style={styles.additionalSongInfo}>
              Play count: {song.playcount}
            </NormalText>
            <NormalText style={styles.additionalSongInfo}>
              Marked as played: {song.isMarkedAsPlayed ? "✔" : "x"}
            </NormalText>
          </View>
        </FlipCard>
      </View>
    );
  }
}

AlbumArt.propTypes = {
  song: React.PropTypes.object.isRequired,
};
