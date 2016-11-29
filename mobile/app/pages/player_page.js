import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image, ActivityIndicator } from 'react-native';

import { colors } from '../styles/styles'
import Button from '../components/button'

import playerProxy from '../native_proxy/player_proxy'

export default class PlayerPage extends Component {

  componentWillMount() {
    this.state = {};

    playerProxy.changePlaylist(this.props.playlistName)
    playerProxy.play();
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start`);

    return (
      <View style={styles.container}>
        <Text style={styles.playlistText}>
          Player goes here with playlist: {this.props.playlistName}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: "center",
    alignSelf: "stretch"
  },
  playlistText: {
    color: colors.SEMI_WHITE.rgbString(),
    fontSize: 15,
  }
});