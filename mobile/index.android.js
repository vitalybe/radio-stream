import React, { Component } from 'react';
import { COLORS } from './styles/styles'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ProgressBar,
  ActivityIndicator
} from 'react-native';

import Button from './components/button'

import metadataBackendProxy from './native_proxy/metadata_backend_proxy'

import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");

export default class RadioStream extends Component {
  _fetchPlaylists() {
    let logger = loggerCreator(this._fetchPlaylists.name, moduleLogger);
    logger.info("start");

    metadataBackendProxy.fetchPlaylists().then(result => {
      logger.info(`got results: ${result}`);
      this.setState({playlists: result})
    })

  }

  componentWillMount() {
    this.state = {};
    this._fetchPlaylists();
  }

  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    var playlists;
    if (this.state.playlists) {
      playlists = (
        <Button onPress={this._fetchPlaylists.bind(this)}>
          <Text style={styles.text}>Temp</Text>
        </Button>
      );
    } else {
      playlists = <ActivityIndicator />;
    }

    return (
      <Image source={require("./images/background.jpg")}
             resizeMode="cover"
             style={styles.container}>
        {playlists}
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
  },
  text: {
    color: COLORS.SEMI_WHITE.rgbString()
  }
});

AppRegistry.registerComponent('RadioStream', () => RadioStream);
