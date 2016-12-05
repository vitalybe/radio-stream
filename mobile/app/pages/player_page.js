import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Image, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import playerProxy from '../native_proxy/player_proxy'

import { colors } from '../styles/styles'
import RectangleButton from '../components/rectangle_button'
import CircleButton from '../components/circle_button'
import Text from '../components/text'

import { getArtistImage } from '../utils/backend_lastfm_api'

export default class PlayerPage extends Component {

  PLAYER_STATUS_EVENT = "PLAYER_STATUS_EVENT";

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {
      isLoading: true,
      isPlaying: false,

      playlistName: this.props.playlistName,
      song: {
        artist: null,
        title: null,
        album: null,
        albumArtUri: null
      }
    };

    DeviceEventEmitter.addListener(this.PLAYER_STATUS_EVENT, event => this.onPlayerEvent(event));

    playerProxy.changePlaylist(this.props.playlistName);
    // TODO: uncomment
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
    let logger = loggerCreator("onPlayerEvent", moduleLogger);
    logger.info(`got event: ${JSON.stringify(event)}`);
    event.song = event.song || {};

    // sample event: {"song":{"title":"Strangelove","album":"Music For the Masses","artist":"Depeche Mode"},
    //                "playlist":{"name":"Peaceful"},"isPlaying":false,"isLoading":true}


    if (event.song.artist && event.song.artist !== this.state.song.artist) {
      logger.info(`artist changed from '${this.state.song.artist}' to '${event.song.artist}' - reloading album cover`);

      this.setState({ song: { ...this.state.song, albumArtUri: null }});
      getArtistImage(event.song.artist).then(imageUri => {
        logger.info(`got album art uri: ${imageUri}`);
        this.setState({ song: { ...this.state.song, albumArtUri: imageUri }});
      })
    }

    this.setState({
      isLoading: event.isLoading,
      isPlaying: event.isPlaying,
      song: {
        ...this.state.song,
        artist: event.song.artist,
        title: event.song.title,
        album: event.song.album,
      }
    });
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    let albumArt = require("../images/no-album2.png");
    logger.info(`uri: ${this.state.song.albumArtUri}`);
    if (this.state.song.albumArtUri) {
      albumArt = {uri: this.state.song.albumArtUri};
    }

    return (
      <View style={styles.container}>
        <Text>
          {this.props.playlistName}
        </Text>
        <Choose>
          {/* TODO: add ! */}
          <When condition={!this.state.isLoading}>
            <Text>{`${this.state.song.artist} - ${this.state.song.album} - ${this.state.song.title}`}</Text>
            {/* Album art */}
            <View style={styles.albumArtView}>
              <Image style={styles.albumArt} source={albumArt}/>
            </View>
            {/* Controls */}
            <View style={styles.controlsView}>
              <CircleButton size={100} onPress={() => this.onPressPlayPause()}>
                <Icon name={this.state.isPlaying ? "pause" : "play"} style={styles.controlButton}/>
              </CircleButton>
              <CircleButton size={60} onPress={() => this.onPressNext()}>
                <Icon name="step-forward" style={styles.controlButton}/>
              </CircleButton>
            </View>
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
  },
  albumArtView: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK.rgbString(),
    borderWidth: 2,

    justifyContent: "center",
    alignItems: "center",

  },
  albumArt: {
    width: 200,
    height: 200,
    resizeMode: "contain"
  },
  controlsView: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 60, // Causes the play button to be in the center
  },
  controlButton: {
    color: colors.SEMI_WHITE.rgbString(), fontSize: 40
  }
});