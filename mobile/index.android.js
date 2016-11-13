import React, { Component } from 'react';
import Color from 'color';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image
} from 'react-native';
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
        <TouchableHighlight style={styles.button}
                            underlayColor={CYAN_DARK.clone().clearer(0.5).rgbString()}
                            activeOpacity={1}
                            onPress={() => {
          logger.info("fetching playlist");
          metadataBackendProxy.fetchPlaylists().then(result => {
            logger.info(result);
          })
        }}>
          <Text style={styles.text}>Temp</Text>
        </TouchableHighlight>
      </Image>
    );
  }
}

const CYAN_DARK = Color("#335d66");
const CYAN_BRIGHT = Color("#71cfe2");
const SEMI_WHITE = Color("#e2e2e2");
const RED = Color("#e25d24");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: 'center',
  },
  button: {
    backgroundColor: CYAN_DARK.clone().clearer(0.8).rgbString(),
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderColor: CYAN_BRIGHT.rgbString(),
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    color: SEMI_WHITE.rgbString()
  }
});

AppRegistry.registerComponent('RadioStream', () => RadioStream);
