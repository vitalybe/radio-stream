import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongsGrid");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import { observer } from "mobx-react";

import { HeaderRow, SongRow } from "./rows";

const MIN_CELL_WIDTH = 110;

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
        {this.props.songs.map(song => {
          return (
            <SongRow
              key={song.id}
              visibleColumns={this.state.visibleColumns}
              song={song}
              isHighlighted={this.props.highlightedSong === song}
            />
          );
        })}
      </View>
    );
  }
}

SongsGrid.propTypes = {
  songs: React.PropTypes.array.isRequired,
  highlightedSong: React.PropTypes.object,
};
