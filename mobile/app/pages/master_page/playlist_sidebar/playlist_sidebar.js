import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlaylistSidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import { observer } from "mobx-react";

import masterStore from "app/stores/master_store";
import { colors } from "app/styles/styles";

const WIDTH = 336;
const OPEN_RIGHT = -2;
const CLOSED_RIGHT = OPEN_RIGHT - WIDTH;

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
    borderTopLeftRadius: 5,
  },
});

@observer
export default class PlaylistSidebar extends Component {
  render() {
    loggerCreator(this.render.name, moduleLogger);

    const right = masterStore.isPlaylistSidebarOpen ? OPEN_RIGHT : CLOSED_RIGHT;

    return (
      <ScrollView horizontal={false} style={[styles.sidebar, { right: right }]}>
        <View
          style={{
            backgroundColor: "yellow",
            width: 100,
            height: 200,
          }}
        />
        <View
          style={{
            backgroundColor: "orange",
            width: 100,
            height: 200,
          }}
        />
        <View
          style={{
            backgroundColor: "yellow",
            width: 100,
            height: 200,
          }}
        />
        <View
          style={{
            backgroundColor: "orange",
            width: 100,
            height: 200,
          }}
        />
        <View
          style={{
            backgroundColor: "yellow",
            width: 100,
            height: 200,
          }}
        />
        <View
          style={{
            backgroundColor: "orange",
            width: 100,
            height: 200,
          }}
        />
      </ScrollView>
    );
  }
}

PlaylistSidebar.propTypes = {};
