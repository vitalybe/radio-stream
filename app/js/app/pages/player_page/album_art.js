import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("AlbumArt");

import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";

import { colors } from "app/styles/styles";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK,
    borderWidth: 2,
    flex: 1,

    position: "relative",
  },
  albumArt: {
    resizeMode: "cover",
    flex: 1,
    width: null,
    height: null,
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
      <View style={[styles.container, this.props.style]}>
        <Image style={[styles.albumArt]} source={albumArt} />
      </View>
    );
  }
}

AlbumArt.propTypes = {
  song: React.PropTypes.object.isRequired,
};
