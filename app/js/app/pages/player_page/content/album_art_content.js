import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("AlbumArtContent");

import React, { Component } from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";

import contentStyle from "./content_style";

const styles = StyleSheet.create({
  container: {
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
export default class AlbumArtContent extends Component {
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
      <View style={[contentStyle.container, styles.container, this.props.style]}>
        <Image style={[styles.albumArt]} source={albumArt} />
      </View>
    );
  }
}

AlbumArtContent.propTypes = {
  song: React.PropTypes.object.isRequired,
};
