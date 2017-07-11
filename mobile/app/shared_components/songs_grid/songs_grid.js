import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongsGrid");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import { observer } from "mobx-react";
import NormalText from "app/shared_components/text/normal_text";
import SmallText from "app/shared_components/text/small_text";

import playImage from "app/images/play.png";

const MIN_CELL_WIDTH = 110;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    flex: 1,
  },
  nameCell: {
    flexGrow: 9,
  },
  headerText: {
    fontWeight: "bold",
  },
  gridCell: {
    flexGrow: 1,
    minWidth: MIN_CELL_WIDTH,

    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  playImage: {
    width: 15,
    height: 27,
    resizeMode: "contain",
  },
  nameContainer: {},
});

@observer
export default class SongsGrid extends Component {
  componentWillMount() {
    this.state = { visibleColumns: 0 };
  }

  _onContainerLayout = event => {
    let { height, width } = event.nativeEvent.layout;

    const logger = loggerCreator("_onContainerLayout", moduleLogger);
    logger.info(`height: ${height} width: ${width}`);

    const visibleColumns = Math.floor(width / MIN_CELL_WIDTH);
    logger.info(`visible columns: ${visibleColumns}`);
    this.setState({ visibleColumns: visibleColumns });
  };

  render() {
    const logger = loggerCreator("render", moduleLogger);

    return (
      <View style={styles.container} onLayout={this._onContainerLayout}>
        <View style={styles.header}>
          {[
            <NormalText key="name" style={[styles.gridCell, styles.nameCell, styles.headerText]}>
              Name
            </NormalText>,
            <NormalText key="rating" style={[styles.gridCell, styles.headerText]}>
              Rating
            </NormalText>,
            <NormalText key="lastPlayed" style={[styles.gridCell, styles.headerText]}>
              Last played
            </NormalText>,
            <NormalText key="playCount" style={[styles.gridCell, styles.headerText]}>
              Play count
            </NormalText>,
          ].slice(0, this.state.visibleColumns)}
        </View>
        <View style={styles.row}>
          {[
            <View key="name" style={[styles.gridCell, styles.nameCell]}>
              <Image source={playImage} style={styles.playImage} />
              <View style={styles.nameContainer}>
                <SmallText>Title</SmallText>
                <SmallText style={styles.artistText}>Artist</SmallText>
              </View>
            </View>,
            <View key="rating" style={[styles.gridCell]}>
              <SmallText>**oo.</SmallText>
            </View>,
            <View key="lastPlayed" style={[styles.gridCell]}>
              <SmallText>Just now</SmallText>
            </View>,
            <View key="playCount" style={[styles.gridCell]}>
              <SmallText>35</SmallText>
            </View>,
          ].slice(0, this.state.visibleColumns)}
        </View>
      </View>
    );
  }
}

SongsGrid.propTypes = {};
