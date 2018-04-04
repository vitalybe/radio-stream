import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("icon");

require("../lib/font-awesome/css/font-awesome.min.css");

import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import FontAwesome from "react-fontawesome";

export default class Icon extends Component {
  render() {
    let logger = loggerCreator("render", moduleLogger);

    return (
      <View>
        <FontAwesome name={this.props.name} style={StyleSheet.flatten(this.props.style)} />
      </View>
    );
  }
}
