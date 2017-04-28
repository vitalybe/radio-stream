import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import App from './app/index';

class ReactNativeWeb extends Component {
  render() {
    return <App/>;
  }
}

AppRegistry.registerComponent('ReactNativeWeb', () => ReactNativeWeb);
AppRegistry.runApplication('ReactNativeWeb', {rootTag: document.getElementById('react-app')});
