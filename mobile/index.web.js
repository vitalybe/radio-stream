import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import App from './app/app';

class RadioStreamWeb extends Component {
  render() {
    return <App/>;
  }
}

AppRegistry.registerComponent('ReactNativeWeb', () => RadioStreamWeb);
AppRegistry.runApplication('ReactNativeWeb', {rootTag: document.getElementById('react-app')});
