import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongsGrid");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import { observer } from "mobx-react";
import NormalText from "app/shared_components/text/normal_text";
import SmallText from "app/shared_components/text/small_text";

import playImage from "app/images/play.png";
import Rating from "app/shared_components/rating";
import { HeaderRow, SongRow } from "./rows";

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
    loggerCreator("render", moduleLogger);

    return (
      <View onLayout={this._onContainerLayout}>
        <HeaderRow visibleColumns={this.state.visibleColumns} />
        <SongRow visibleColumns={this.state.visibleColumns} song={this.props.playlist.currentSong} />
      </View>
    );
  }
}

SongsGrid.propTypes = {
  playlist: React.PropTypes.object.isRequired,
};
