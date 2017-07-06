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
    padding: 10,
  },
  additionalSongInfo: {
    marginBottom: 5,
  },
});

@observer
export default class AlbumArt extends Component {
  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    this.state = {
      artSize: 260,
    };

    // window.addEventListener("resize", () => {
    //   logger.info(`resize occured`);
    //   if (this.containerView) {
    //     logger.info(`measuring...`);
    //     this.containerView.measure((a, b, width, height, px, py) => logger.log(`measure: ${width} ${height}`));
    //   }
    // });
  }

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
      <View
        style={this.props.style}
        onLayout={event => {
          let { x, y, width, height } = event.nativeEvent.layout;
          this.setState({ artSize: height });
          logger.log(`Layout: ${width} ${height}`);
          // logger.info(`measuring...`);
          // this.containerView.measure((a, b, width, height, px, py) => logger.log(`measure: ${width} ${height}`));
        }}
        ref={containerView => {
          logger.info(`Got ref for container view`);
          this.containerView = containerView;
        }}>
        <FlipCard
          style={styles.container}
          flipHorizontal={true}
          flipVertical={false}
          alignHeight={false}
          alignWidth={false}>
          <View>
            <Image
              style={[styles.albumArt, { width: this.state.artSize, height: this.state.artSize }]}
              source={albumArt}
            />
          </View>
          <View style={[styles.flippedAlbumArt, { width: this.state.artSize, height: this.state.artSize }]}>
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
