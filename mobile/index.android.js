import {AppRegistry} from 'react-native';
import React, {Component} from 'react';

import App from './app/app'
import TestFairy from 'react-native-testfairy';

class RadioStreamAndroid extends Component {
  componentWillMount() {
    TestFairy.begin("764a3f516e3fdab9f742b8aaf02f2058bd95890c");
  }

  render() {
    return <App/>;
  }
}

AppRegistry.registerComponent('RadioStream', () => RadioStreamAndroid);
