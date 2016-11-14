import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");


import React, { Component } from 'react';
import {
  StyleSheet,
  Image
} from 'react-native';

import PlaylistCollectionPage from './pages/playlist_collection_page'

import { navigator, routes } from  './stores/navigator'

export default class RadioStream extends Component {
  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);
    logger.info(`start. activate route: ${navigator.activeRoute}`);

    let page = null;

    switch (navigator.activeRoute) {
      case routes.PLAYLIST_COLLECTION_PAGE:
        page = <PlaylistCollectionPage />;
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