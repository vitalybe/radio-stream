import loggerCreator from './utils/logger'
var moduleLogger = loggerCreator("index.android");

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ProgressBar,
  ActivityIndicator
} from 'react-native';

import { colors } from './styles/styles'
import Button from './components/button'

import metadataBackendProxy from './native_proxy/metadata_backend_proxy'

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

    return (
      <Image source={require("./images/background.jpg")}
             resizeMode="cover"
             style={styles.container}>
        <Choose>
          <When condition={this.state.playlists}>
            {
              this.state.playlists.map(playlist => {
                return (
                  <Button key={playlist}
                          className="playlist"
                          onPress={() => logger.info(`clicked playlist: ${playlist}`)}>
                    <Text style={styles.text}>{playlist}</Text>
                  </Button>)
              })
            }
          </When>
          <Otherwise>
            <ActivityIndicator />
          </Otherwise>
        </Choose>
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
    color: colors.SEMI_WHITE.rgbString()
  }
});