import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("player_page");

import React, {Component} from 'react';
import {StyleSheet, View, TouchableHighlight, Image, ActivityIndicator, BackAndroid, AppState} from 'react-native';
import { observer } from "mobx-react"

import Icon from '../components/icon'
import player from '../stores/player'
import {colors, fontSizes} from '../styles/styles'
import CircleButton from '../components/circle_button'
import Text from '../components/text'
import Rating from '../components/rating'
import Navigator from '../stores/navigator'

@observer
export default class PlayerPage extends Component {

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start playlist: ${this.props.playlistName}`);

    BackAndroid.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());
  }

  onHandleAppStateChange = async (currentAppState) => {
    let logger = loggerCreator("onHandleAppStateChange", moduleLogger);
    logger.info(`start: ${currentAppState}`);

    if (currentAppState === 'active') {
      await player.updatePlayerStatus();
      if (!player.playlistName) {
        logger.info(`no playlist selected - navigating to playlist collection`);
        this.props.navigator.navigateToPlaylistCollection();
      }
    }
  };

  componentDidMount() {
    let logger = loggerCreator("componentDidMount", moduleLogger);
    logger.info(`start`);

    AppState.addEventListener('change', this.onHandleAppStateChange);
  }

  componentWillUnmount() {
    let logger = loggerCreator("componentWillUnmount", moduleLogger);
    logger.info(`start`);
    AppState.removeEventListener('change', this.onHandleAppStateChange);
  }

  onPressPlayPause() {
    let logger = loggerCreator("onPressPlayPause", moduleLogger);
    logger.info(`start`);

    if (player.isPlaying) {
      logger.info(`pause`);
      player.pause();
    } else {
      logger.info(`play`);
      player.play();
    }

  }

  onPressNext() {
    player.playNext();
  }

  onPressHardwareBack() {
    let logger = loggerCreator("hardwareBackPress", moduleLogger);
    logger.info(`start`);
    player.pause();
    this.props.navigator.navigateToPlaylistCollection();
    return true;
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    let albumArt = require("../images/no-album2.png");
    logger.info(`uri: ${player.songArtUri}`);
    if (player.songArtUri) {
      albumArt = {uri: player.songArtUri};
    }

    let loadingStatus = "Loading";
    if (player.songTitle) {
      loadingStatus = `${loadingStatus}: ${player.songArtist} - ${player.songTitle}`
    }

    let loadingError = "";
    if (player.loadingError) {
      loadingError = `Error occurred, retrying: ${player.loadingError}`
    }

    return (
      <View style={styles.container}>
        <View style={styles.playlistNameView}>
          <Icon name="music" style={styles.playlistIcon}/>
          <Text>{this.props.playlistName}</Text>
        </View>
        <Choose>
          <When condition={!player.isLoading}>
            {/* Album art */}
            <View style={styles.albumArtView}>
              <Image style={styles.albumArt} source={albumArt}/>
            </View>
            {/* Ratings */}
            <Rating style={[styles.rating]}
                    rating={player.songRating} songId={player.songId}/>
            {/* Names */}
            <View style={styles.namesView}>
              <Text style={[styles.nameText, styles.titleText]}>{`${player.songTitle}`}</Text>
              <Text style={[styles.nameText, styles.artistText]}>{`${player.songArtist}`}</Text>
              <Text style={[styles.nameText, styles.albumText]}>{`${player.songAlbum}`}</Text>
            </View>
            {/* Controls */}
            <View style={styles.controlsView}>
              <CircleButton size={100} onPress={() => this.onPressPlayPause()}
                            style={[styles.controlButtonPlay]}>
                <Icon name={player.isPlaying ? "pause" : "play"}
                      style={[styles.controlButtonText, player.isPlaying ? styles.controlTextPause : styles.controlTextPlay]}/>
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
  // Ratings
  rating: {
    marginBottom: 20
  },
  // Names (artist, title, album)
  namesView: {
    alignItems: "center",
  },
  nameText: {
    fontSize: fontSizes.LARGE,
    marginBottom: 2
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
