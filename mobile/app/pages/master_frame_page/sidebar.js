import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import masterFrame from "../../stores/master_frame";
import { colors } from "../../styles/styles";

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 66,
    bottom: -1,
    left: -1,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopRightRadius: 5,
  },
});

OPEN_WIDTH = 336;
CLOSED_WIDTH = -1;

@observer
export default class Sidebar extends Component {
  render() {
    const width = masterFrame.isNavigationSidebarOpen ? OPEN_WIDTH : CLOSED_WIDTH;

    return <View style={[styles.sidebar, { width: width }]} />;
  }
}

Sidebar.propTypes = {};
