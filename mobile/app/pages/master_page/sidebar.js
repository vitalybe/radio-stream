import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import masterStore from "../../stores/master_store";
import { colors } from "../../styles/styles";
import SidebarMenuItem from "./sidebar_menu_item";
import SidebarMenuTitle from "./sidebar_menu_title";

import playIcon from "../../images/play-icon.png";

OPEN_LEFT = -2;
OPEN_WIDTH = 336;

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 59,
    bottom: -1,
    left: OPEN_LEFT,
    width: OPEN_WIDTH,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopRightRadius: 5,
  },
});

@observer
export default class Sidebar extends Component {
  render() {
    loggerCreator(this.render.name, moduleLogger);

    const left = masterStore.isNavigationSidebarOpen ? OPEN_LEFT : OPEN_LEFT - OPEN_WIDTH;

    return (
      <View style={[styles.sidebar, { left: left }]}>
        <SidebarMenuTitle text="Radio Stream" />
        <SidebarMenuItem text="Player" image={playIcon} />
        <SidebarMenuItem text="Player" image={playIcon} isActive={true} />
        <SidebarMenuTitle text="Radio Stream" />
        <SidebarMenuItem text="Player" image={playIcon} />
        <SidebarMenuItem text="Player" image={playIcon} />
      </View>
    );
  }
}

Sidebar.propTypes = {};
