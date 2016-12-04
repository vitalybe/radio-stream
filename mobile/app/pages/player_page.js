import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Image, ActivityIndicator, DeviceEventEmitter } from 'react-native';

import { colors } from '../styles/styles'
import Button from '../components/button'
import Text from '../components/text'

import playerProxy from '../native_proxy/player_proxy'

export default class PlayerPage extends Component {

  PLAYER_STATUS_EVENT = "PLAYER_STATUS_EVENT";

  componentWillMount() {
    this.state = {
      isLoading: true,
      isPlaying: false,

      playlistName: this.props.playlistName,
      song: null
    };

    DeviceEventEmitter.addListener(this.PLAYER_STATUS_EVENT, event => this.onPlayerEvent(event));

    playerProxy.changePlaylist(this.props.playlistName);
    playerProxy.play();
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners(this.PLAYER_STATUS_EVENT);
  }

  onPressPlayPause() {
    playerProxy.playPause();
  }

  onPressNext() {
    playerProxy.playNext();
  }

  onPlayerEvent(event) {
    let logger = loggerCreator(this.onPlayerEvent.name, moduleLogger);
    logger.info(`got event: ${JSON.stringify(event)}`);

    // sample event: {"song":{"title":"Strangelove","album":"Music For the Masses","artist":"Depeche Mode"},
    //                "playlist":{"name":"Peaceful"},"isPlaying":false,"isLoading":true}

    event.song = event.song || {};

    this.setState({
      isLoading: event.isLoading,
      isPlaying: event.isPlaying,
      song: {
        artist: event.song.artist,
        title: event.song.title,
        album: event.song.album,
      }
    })
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start`);



    return (
      <View style={styles.container}>
        <Text>
          {this.props.playlistName}
        </Text>
        <Choose>
          <When condition={!this.state.isLoading}>
            <Text>{`${this.state.song.artist} - ${this.state.song.album} - ${this.state.song.title}`}</Text>
            {/* Controls */}
            <Button onPress={() => this.onPressPlayPause()}>
              <Text>{this.state.isPlaying ? "Pause" : "Play"}</Text>
            </Button>
            <Button onPress={() => this.onPressNext()}>
              <Text>Next</Text>
            </Button>
          </When>
          <Otherwise>
            <ActivityIndicator />
          </Otherwise>
        </Choose>
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
  }
});