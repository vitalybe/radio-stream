import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("playlist_collection_page");

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image, ActivityIndicator, BackAndroid } from 'react-native';

import playerProxy from '../native_proxy/player_proxy'
import { colors, fontSizes } from '../styles/styles'
import Button from '../components/rectangle_button'
import Navigator from '../stores/navigator'

export default class PlaylistCollectionPage extends Component {

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {};
    BackAndroid.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());

    logger.info(`getting status...`);
    playerProxy.getPlayerStatus().then(status => {
      logger.info(`got status: ${JSON.stringify(status)}`);
      var playlistPlayer = status.playlistPlayer;

      if (playlistPlayer && playlistPlayer.isPlaying) {
        logger.info(`player currently playing - navigating to player`);
        this.props.navigator.navigateToPlayer(playlistPlayer.playlist.name)
      } else {
        this.fetchPlaylists();
      }
    });
  }

  fetchPlaylists() {
    let logger = loggerCreator("fetchPlaylists", moduleLogger);
    logger.info(`start`);

    playerProxy.fetchPlaylists().then(result => {
      logger.info(`got results: ${result}`);
      this.setState({playlists: result})
    })
  }

  onPressHardwareBack() {
    let logger = loggerCreator("onPressHardwareBack", moduleLogger);
    logger.info(`start`);
    playerProxy.stopPlayer();

    BackAndroid.exitApp();
    return true;
  }

  onPlaylistClick(playlistName) {
    let logger = loggerCreator(this.onPlaylistClick.name, moduleLogger);
    logger.info(`start: ${playlistName}`);

    this.props.navigator.navigateToPlayer(playlistName);
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start`);

    return (
      <View style={styles.container}>
        <Image source={require("../images/logo.png")}
               style={styles.logo}/>

        <Choose>
          <When condition={this.state.playlists}>
            {
              this.state.playlists.map(playlist => {
                return (
                  <Button key={playlist} style={styles.playlistButton}
                          className="playlist"
                          onPress={() => this.onPlaylistClick(playlist)}>
                    <Text style={styles.playlistText}>{playlist}</Text>
                  </Button>)
              })
            }
          </When>
          <Otherwise>
            <ActivityIndicator />
          </Otherwise>
        </Choose>
        <Button style={styles.settingsButton}
                onPress={() => logger.info(`clicked settings`)}>
          <Image style={styles.settingsIcon} source={require("../images/settings.png")}/>
        </Button>
      </View>
    );
  }
}

PlaylistCollectionPage.propTypes = {
  navigator: React.PropTypes.instanceOf(Navigator).isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: "center",
    alignSelf: "stretch"
  },
  logo: {
    width: 90,
    height: 90,
    marginVertical: 20,
    resizeMode: "contain"
  },
  playlistButton: {
    width: 150,
    marginBottom: 10,
  },
  playlistText: {
    color: colors.SEMI_WHITE.rgbString(),
    fontSize: fontSizes.NORMAL,
  },
  settingsButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain"
  },
});