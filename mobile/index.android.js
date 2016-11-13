import React, { Component } from 'react';
import { COLORS } from './styles/styles'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image
} from 'react-native';

import Button from './components/button'

import metadataBackendProxy from './native_proxy/metadata_backend_proxy'

import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");

export default class RadioStream extends Component {
  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    return (
      <Image source={require("./images/background.jpg")}
             resizeMode="cover"
             style={styles.container}>
        <Button onPress={() => {
          logger.info("fetching playlist");
          metadataBackendProxy.fetchPlaylists().then(result => {
            logger.info(result);
          })
        }}>
          <Text style={styles.text}>Temp</Text>
        </Button>
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
