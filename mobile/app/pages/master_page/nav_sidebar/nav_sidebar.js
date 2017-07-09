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

const WIDTH = 336;
const OPEN_LEFT = -2;
const CLOSED_LEFT = OPEN_LEFT - WIDTH;

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 54,
    bottom: -1,
    width: WIDTH,
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

    const left = masterStore.isNavigationSidebarOpen ? OPEN_LEFT : CLOSED_LEFT;

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
