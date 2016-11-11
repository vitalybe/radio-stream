import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from 'react-native';
import metadataBackendProxy from './native_proxy/metadata_backend_proxy'

import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");

export default class RadioStream extends Component {
  render() {
    let logger = loggerCreator(this.render.name, moduleLogger);

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
        <TouchableHighlight onPress={() => {
          logger.info("fetching playlist");
          metadataBackendProxy.fetchPlaylists().then(result => {
            logger.info(result);
          })
        }}><Text>Temp</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('RadioStream', () => RadioStream);
