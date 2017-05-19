import loggerCreator from '../../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("AlbumArt");

import React, {Component} from 'react';
import {Image, StyleSheet, View,} from 'react-native';
import FlipCard from '../../utils/flip_card'
import Text from '../../shared_components/text'

import {colors, fontSizes} from '../../styles/styles'

const styles = StyleSheet.create({
  albumArtView: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK.rgbString(),
    borderWidth: 2,

    width: 200,
    height: 200,

    position: 'relative',
    marginBottom: 20,
  },
  albumArt: {
    resizeMode: "contain",
    flex: 1,
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
        <FlipCard style={styles.albumArtView}>
          <View style={{flex: 1}}>
            <Image style={styles.albumArt} source={albumArt}/>
          </View>
          <View >
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
