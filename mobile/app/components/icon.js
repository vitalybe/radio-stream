import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator("icon");

require("../lib/font-awesome/css/font-awesome.min.css");

import React, { Component } from 'react';
import { Text, View } from 'react-native';
import FontAwesome from 'react-fontawesome'

export default class Icon extends Component {
  render() {

    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start: ${this.props.style}`);

    return (
      <View>
        <FontAwesome name={this.props.name}  />
      </View>
    );
  }
}