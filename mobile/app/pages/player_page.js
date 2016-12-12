import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableHighlight, Image, ActivityIndicator, DeviceEventEmitter, BackAndroid, AppState } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import playerProxy from '../native_proxy/player_proxy'

import { colors, fontSizes } from '../styles/styles'
import RectangleButton from '../components/rectangle_button'
import CircleButton from '../components/circle_button'
import Text from '../components/text'

import Navigator from '../stores/navigator'
import { getArtistImage } from '../utils/backend_lastfm_api'

export default class PlayerPage extends Component {

  PLAYLIST_PLAYER_STATUS_EVENT = "PLAYLIST_PLAYER_STATUS_EVENT";

  resolveWhenPlayerAvailable() {
    let logger = loggerCreator("resolveWhenPlayerAvailable", moduleLogger);
    logger.info(`start`);

    return playerProxy.isPlayerAvailable().then(isAvailable => {
      if (!isAvailable) {
        logger.info(`not available - retrying`);
        return this.resolveWhenPlayerAvailable();
      }
    });
  }

  refreshStatus() {
    let logger = loggerCreator("refreshStatus", moduleLogger);
    logger.info(`start`);
    
    logger.info(`waiting for player to be available`);
    this.resolveWhenPlayerAvailable().then(() => {
      logger.info(`player available`);
      return playerProxy.getPlayerStatus();  
    }).then(status => {
      logger.info(`got status: ${JSON.stringify(status)}`);
      logger.info(`this.playlistChosen: ${this.playlistChosen}`);

      var playlistPlayer = status.playlistPlayer;

      if (!playlistPlayer && this.playlistChosen) {
        logger.info(`player service restarted`);
        this.props.navigator.navigateToPlaylistCollection();
      } else if (playlistPlayer && playlistPlayer.isPlaying && playlistPlayer.playlist.name == this.props.playlistName) {
        logger.info(`playing existing playlist`);
        this.onPlaylistPlayerStatus(playlistPlayer);
      } else {
        logger.info(`changing playlist to: ${this.props.playlistName}`);
        playerProxy.changePlaylist(this.props.playlistName);
        playerProxy.play();

        this.playlistChosen = true;
      }
    });
  }

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start playlist: ${this.props.playlistName}`);

    this.playlistChosen = false;

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

    DeviceEventEmitter.addListener(this.PLAYLIST_PLAYER_STATUS_EVENT, event => this.onPlaylistPlayerStatus(event));
    BackAndroid.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());
    AppState.addEventListener('change', currentAppState => this.onHandleAppStateChange(currentAppState));

    this.refreshStatus();
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners(this.PLAYLIST_PLAYER_STATUS_EVENT);
    AppState.removeEventListener('change', this.onHandleAppStateChange());
  }

  onHandleAppStateChange(currentAppState) {
    let logger = loggerCreator("onHandleAppStateChange", moduleLogger);
    logger.info(`start: ${currentAppState}`);

    if (currentAppState === 'active') {
      this.refreshStatus();
    }
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
    playerProxy.pause();
    this.props.navigator.navigateToPlaylistCollection();
    return true;
  }

  onPlaylistPlayerStatus(status) {
    let logger = loggerCreator("onPlaylistPlayerStatus", moduleLogger);
    logger.info(`got event: ${JSON.stringify(status)}`);
    status.song = status.song || {};

    // sample status: {"song":{"title":"Strangelove","album":"Music For the Masses","artist":"Depeche Mode"},
    //                "playlist":{"name":"Peaceful"},"isPlaying":false,"isLoading":true}


    if (status.song.artist && status.song.artist !== this.state.song.artist) {
      logger.info(`artist changed from '${this.state.song.artist}' to '${status.song.artist}' - reloading album cover`);

      this.setState({song: {...this.state.song, albumArtUri: null}});
      getArtistImage(status.song.artist).then(imageUri => {
        logger.info(`got album art uri: ${imageUri}`);
        this.setState({song: {...this.state.song, albumArtUri: imageUri}});
      })
    }

    this.setState({
      isLoading: status.isLoading,
      loadingError: status.loadingError,
      isPlaying: status.isPlaying,
      song: {
        ...this.state.song,
        artist: status.song.artist,
        title: status.song.title,
        album: status.song.album,
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
    if (this.state.song.title) {
      loadingStatus = `${loadingStatus}: ${this.state.song.artist} - ${this.state.song.title}`
    }

    let loadingError = "";
    if (this.state.loadingError) {
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
