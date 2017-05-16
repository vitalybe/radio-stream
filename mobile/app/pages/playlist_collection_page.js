import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("playlist_collection_page");

import React, {Component} from 'react';
import {StyleSheet, Text, View, Image, ActivityIndicator} from 'react-native';
import BackHandler from '../utils/back_handler/back_handler'
import {observer} from "mobx-react"

import player from '../stores/player'
import {colors, fontSizes} from '../styles/styles'
import Button from '../components/rectangle_button'
import Navigator from '../stores/navigator'
import backendMetadataApi from '../utils/backend_metadata_api'
import {globalSettings} from '../utils/settings'
import FlipCard from '../utils/flip_card'

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
  face: {
    flex: 1,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    flex: 1,
    backgroundColor: '#f1c40f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

@observer
export default class PlaylistCollectionPage extends Component {

  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);

    this.state = {};
    BackHandler.addEventListener('hardwareBackPress', () => this.onPressHardwareBack());

    logger.info(`fetching persisted settings`);
    if (globalSettings.host) {

      logger.info(`updated status. playing? ${player.isPlaying}`);
      if (player.isPlaying) {
        logger.info(`player currently playing - navigating to player`);
        this.props.navigator.navigateToPlayer(player.currentPlaylist.name)
      } else {
        logger.info(`proceed as usual - fetching playlists`);
        this.fetchPlaylists();
      }

    } else {
      logger.info(`host not found in settings - showing settings page`);
      this.props.navigator.navigateToSettings();
    }
  }

  async fetchPlaylists() {
    let logger = loggerCreator("fetchPlaylists", moduleLogger);

    try {
      let result = await backendMetadataApi.playlists();
      logger.info(`got results: ${result}`);
      this.setState({playlists: result})
    } catch (err) {
      logger.error(`failed to get playlists`);
    }
  }

  onPressHardwareBack() {
    let logger = loggerCreator("onPressHardwareBack", moduleLogger);
    player.stopPlayer();

    BackHandler.exitApp();
    return true;
  }

  async onPlaylistClick(playlistName) {
    let logger = loggerCreator(this.onPlaylistClick.name, moduleLogger);
    logger.info(`${playlistName}`);

    await player.changePlaylist(playlistName);
    player.play();
    this.props.navigator.navigateToPlayer(playlistName);
  }

  onSettingsClick() {
    this.props.navigator.navigateToSettings();
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

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
                onPress={() => this.onSettingsClick() }>
          <Image style={styles.settingsIcon} source={require("../images/settings.png")}/>
        </Button>
        <View>
          <FlipCard>
            {/* Face Side */}
            <View style={styles.face}>
              <Text>The Face</Text>
            </View>
            {/* Back Side */}
            <View style={styles.back}>
              <Text>The Back</Text>
            </View>
          </FlipCard>
        </View>
      </View>
    );
  }
}

PlaylistCollectionPage.propTypes = {
  navigator: React.PropTypes.instanceOf(Navigator).isRequired
};