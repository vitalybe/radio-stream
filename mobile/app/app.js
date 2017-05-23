import loggerCreator from './utils/logger'
const moduleLogger = loggerCreator("index.android");

import React, {Component} from 'react';
import {StyleSheet, Image} from 'react-native';
import {observer} from "mobx-react"
import {MenuContext} from './shared_components/context_menu/context_menu';

import {globalSettings} from './utils/settings'
import constants from './utils/constants'
import PlaylistCollectionPage from './pages/playlist_collection_page'
import PlayerPage from './pages/player_page/player_page'
import SettingsPage from './pages/settings_page'
import navigator from  './stores/navigator/navigator'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: 'center',
  }
});

@observer
export default class RadioStream extends Component {

  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);

    this.state = {
      ready: false,
    };

    logger.info(`loading settings`);
    await globalSettings.load();

    logger.info(`settings loaded`);
    this.setState({ready: true})
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`activate route: ${navigator.activeRoute}`);

    let page = null;
    let activeRoute = navigator.activeRoute;

    if (activeRoute) {
      switch (activeRoute.address) {
        case constants.ROUTE_PLAYLIST_COLLECTION_PAGE:
          page = <PlaylistCollectionPage />;
          break;
        case constants.ROUTE_PLAYER_PAGE:
          page = <PlayerPage playlistName={activeRoute.playlistName}/>;
          break;
        case constants.ROUTE_SETTINGS_PAGE:
          page = <SettingsPage />;
          break;
        default:
          throw new Error("unexpected route")
      }
    }

    return (
      <MenuContext>
        <Image source={require("./images/background.jpg")}
               resizeMode="cover"
               style={styles.container}>
          { this.state.ready ? page : null }
        </Image>
      </MenuContext>

    );
  }
}