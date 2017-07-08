import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("NavSidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";

import masterStore from "app/stores/master_store";
import { colors } from "app/styles/styles";
import NavSidebarMenuItem from "./nav_sidebar_menu_item";
import NavSidebarMenuTitle from "./nav_sidebar_menu_title";

import playIcon from "app/images/play.png";
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
export default class NavSidebar extends Component {
  render() {
    loggerCreator(this.render.name, moduleLogger);

    const left = masterStore.isNavigationSidebarOpen ? OPEN_LEFT : OPEN_LEFT - OPEN_WIDTH;

    return (
      <View style={[styles.sidebar, { left: left }]}>
        <NavSidebarMenuTitle text="Radio Stream" />
        <NavSidebarMenuItem text="Player" leftImage={playIcon} />
        <NavSidebarMenuItem text="Player" leftImage={playIcon} isActive={true} />
        <NavSidebarMenuTitle text="Playlists" />
        <NavSidebarMenuItem text="Peaceful" leftImage={playIcon} rightImage={pencilIcon} />
        <NavSidebarMenuItem text="Metal" leftImage={playIcon} rightImage={pencilIcon} />
      </View>
    );
  }
}

NavSidebar.propTypes = {};
