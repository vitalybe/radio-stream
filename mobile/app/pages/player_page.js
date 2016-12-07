import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Image, ActivityIndicator, DeviceEventEmitter, BackAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import playerProxy from '../native_proxy/player_proxy'

import { colors, fontSizes } from '../styles/styles'
import RectangleButton from '../components/rectangle_button'
import CircleButton from '../components/circle_button'
import Text from '../components/text'

import Navigator from '../stores/navigator'
import { getArtistImage } from '../utils/backend_lastfm_api'

export default class PlayerPage extends Component {

  PLAYER_STATUS_EVENT = "PLAYER_STATUS_EVENT";

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {
      isLoading: true,
      loadingError: null,

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
    BackAndroid.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());

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

  onPressHardwareBack() {
      let logger = loggerCreator("hardwareBackPress", moduleLogger);
      logger.info(`start`);
      this.props.navigator.navigateToPlaylistCollection();
      return true;
  }

  onPlayerEvent(event) {
    let logger = loggerCreator("onPlayerEvent", moduleLogger);
    logger.info(`got event: ${JSON.stringify(event)}`);
    event.song = event.song || {};

    // sample event: {"song":{"title":"Strangelove","album":"Music For the Masses","artist":"Depeche Mode"},
    //                "playlist":{"name":"Peaceful"},"isPlaying":false,"isLoading":true}


    if (event.song.artist && event.song.artist !== this.state.song.artist) {
      logger.info(`artist changed from '${this.state.song.artist}' to '${event.song.artist}' - reloading album cover`);

      this.setState({song: {...this.state.song, albumArtUri: null}});
      getArtistImage(event.song.artist).then(imageUri => {
        logger.info(`got album art uri: ${imageUri}`);
        this.setState({song: {...this.state.song, albumArtUri: imageUri}});
      })
    }

    this.setState({
      isLoading: event.isLoading,
      loadingError: event.loadingError,
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

    let loadingStatus = "Loading";
    if(this.state.song.title) {
      loadingStatus = `${loadingStatus}: ${this.state.song.artist} - ${this.state.song.title}`
    }

    let loadingError = "";
    if(this.state.loadingError) {
      loadingError = `Error occured, retrying: ${this.state.loadingError}`
    }

    return (
      <View style={styles.container}>
        <View style={styles.playlistNameView}>
          <Icon name="music" style={styles.playlistIcon}/>
          <Text>{this.props.playlistName}</Text>
        </View>
        <Choose>
          <When condition={!this.state.isLoading}>
            {/* Album art */}
            <View style={styles.albumArtView}>
              <Image style={styles.albumArt} source={albumArt}/>
            </View>
            {/* Controls */}
            <View style={styles.namesView}>
              <Text style={[styles.nameText, styles.titleText]}>{`${this.state.song.title}`}</Text>
              <Text style={[styles.nameText, styles.artistText]}>{`${this.state.song.artist}`}</Text>
              <Text style={[styles.nameText, styles.albumText]}>{`${this.state.song.album}`}</Text>
            </View>
            {/* Controls */}
            <View style={styles.controlsView}>
              <CircleButton size={100} onPress={() => this.onPressPlayPause()}
                            style={[styles.controlButtonPlay]}>
                <Icon name={this.state.isPlaying ? "pause" : "play"}
                      style={[styles.controlButtonText, this.state.isPlaying ? styles.controlTextPause : styles.controlTextPlay]}/>
              </CircleButton>
              <CircleButton size={60} onPress={() => this.onPressNext()}>
                <Icon name="step-forward"
                      style={styles.controlButtonText}/>
              </CircleButton>
            </View>
          </When>
          <Otherwise>
            <View style={styles.progressView}>
              <View style={styles.progressSpinner}>
                <ActivityIndicator size="large"/>
              </View>
              <View style={styles.progressStatus}>
                <Text>{loadingStatus}</Text>
                <Text style={styles.progressStatusError}>{loadingError}</Text>
              </View>
            </View>
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
  // Playlist name
  playlistNameView: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 10,
    paddingTop: 5,
    paddingLeft: 5,
  },
  playlistIcon: {
    color: colors.SEMI_WHITE.rgbString(),
    marginRight: 5,
  },
  // Album
  albumArtView: {
    backgroundColor: "black",
    borderColor: colors.CYAN_DARK.rgbString(),
    borderWidth: 2,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 20
  },
  // Names (artist, title, album)
  namesView: {
    alignItems: "center",
    marginBottom: 10
  },
  nameText: {
    fontSize: fontSizes.LARGE,
    marginBottom: 10
  },
  artistText: {
    color: colors.CYAN_BRIGHT.rgbString()
  },
  albumArt: {
    width: 200,
    height: 200,
    resizeMode: "contain"
  },
  // Controls
  controlsView: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 80, // Causes the play button to be in the center
  },
  controlButtonText: {
    color: colors.SEMI_WHITE.rgbString(),
    fontSize: 40
  },
  controlTextPlay: {
    paddingLeft: 10
  },
  controlTextPause: {
    paddingLeft: 0
  },
  controlButtonPlay: {
    marginRight: 20
  },
  // Progress
  progressSpinner: {
    justifyContent: "flex-end",
    paddingBottom: 10,
    flex: 1,
  },
  progressStatus: {
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 1,
  },
  progressStatusError: {
    color: "red"
  }
});

PlayerPage.propTypes = {
  navigator: React.PropTypes.instanceOf(Navigator).isRequired,
  playlistName: React.PropTypes.string.isRequired,
};
