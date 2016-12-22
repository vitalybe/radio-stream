import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");

import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { observer } from "mobx-react"

import PlaylistCollectionPage from './pages/playlist_collection_page'
import PlayerPage from './pages/player_page'
import SettingsPage from './pages/settings_page'
import Navigator from  './stores/navigator'

import playerProxy from './native_proxy/player_proxy'

@observer
export default class RadioStream extends Component {

  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.navigator = new Navigator();
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start. activate route: ${this.navigator.activeRoute}`);

    let page = null;
    var activeRoute = this.navigator.activeRoute;

    switch (activeRoute.address) {
      case this.navigator.ROUTE_PLAYLIST_COLLECTION_PAGE:
        page = <PlaylistCollectionPage navigator={this.navigator} />;
        break;
      case this.navigator.ROUTE_PLAYER_PAGE:
        page = <PlayerPage playlistName={activeRoute.playlistName} navigator={this.navigator} />;
        break;
      case this.navigator.ROUTE_SETTINGS_PAGE:
        page = <SettingsPage navigator={this.navigator} />;
        break;
    }

    return (
      <Image source={require("./images/background.jpg")}
             resizeMode="cover"
             style={styles.container}>
        {page}
      </Image>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: 'center',
  }
});