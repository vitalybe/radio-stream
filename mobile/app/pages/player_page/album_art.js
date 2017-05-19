import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("AlbumArt");

import React, {Component} from 'react';
import {Image, StyleSheet, View, Dimensions} from 'react-native';
import FlipCard from '../../utils/flip_card'
import Text from '../../shared_components/text'

import {colors, fontSizes} from '../../styles/styles'

// Store width in variable
let width = Dimensions.get('window').width;
const artSize = Math.min(width, 300);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK.rgbString(),
    borderWidth: 2,

    position: 'relative',
    marginBottom: 20,
  },
  albumArt: {
    resizeMode: "contain",

    width: artSize,
    height: artSize,
  },
  flippedAlbumArt: {
    width: artSize,
    height: artSize,
  },

});

export default class AlbumArt extends Component {

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    let albumArt = require("../../images/no-album2.png");

    if (this.props.song.loadedImageUrl) {
      logger.info(`uri: ${this.props.song.loadedImageUrl}`);
      albumArt = {uri: this.props.song.loadedImageUrl};
    }

    return (
      <View>
        <FlipCard style={styles.container}>
          <View>
            <Image style={styles.albumArt} source={albumArt}/>
          </View>
          <View style={styles.flippedAlbumArt}>
            <Text>Hi</Text>
          </View>
        </FlipCard>
      </View>
    );
  }
}

AlbumArt.propTypes = {
  song: React.PropTypes.object.isRequired,
};
