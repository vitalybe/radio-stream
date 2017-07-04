import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import masterStore from "app/stores/master_store";
import { colors } from "app/styles/styles";
import SidebarMenuItem from "./sidebar_menu_item";
import SidebarMenuTitle from "./sidebar_menu_title";

import playIcon from "app/images/play-icon.png";
import pencilIcon from "app/images/pencil-icon.png";

const OPEN_LEFT = -2;
const OPEN_WIDTH = 336;

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
        <SidebarMenuItem text="Player" leftImage={playIcon} />
        <SidebarMenuItem text="Player" leftImage={playIcon} isActive={true} />
        <SidebarMenuTitle text="Playlists" />
        <SidebarMenuItem text="Peaceful" leftImage={playIcon} rightImage={pencilIcon} />
        <SidebarMenuItem text="Metal" leftImage={playIcon} rightImage={pencilIcon} />
      </View>
    );
  }
}

Sidebar.propTypes = {};
