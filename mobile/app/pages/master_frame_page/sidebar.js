import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../styles/styles";

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 66,
    bottom: -1,
    left: -1,
    width: -1, //336,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopRightRadius: 5,
  },
});

export default class Sidebar extends Component {
  render() {
    return <View style={styles.sidebar} />;
  }
}

Sidebar.propTypes = {};
