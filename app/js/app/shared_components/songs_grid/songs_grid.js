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

  calculateVisibleSongs() {
    const logger = loggerCreator("calculateVisibleRows", moduleLogger);

    let visibleSongs = this.props.songs;

    logger.info(`visible rows: ${this.props.visibleRows}`);
    // noinspection JSValidateTypes
    if (this.props.visibleRows !== undefined) {
      // limit visible songs from the beginning or from the currently highlighted song
      let visibleSongsAroundInex = 0;
      if (this.props.highlightedSong) {
        visibleSongsAroundInex = this.props.songs.findIndex(song => song === this.props.highlightedSong);
      }

      logger.info(`highlighted song index: ${visibleSongsAroundInex}`);

      let halfVisibleRows = Math.floor(this.props.visibleRows / 2);
      let sliceStart = Math.max(visibleSongsAroundInex - halfVisibleRows, 0);
      logger.info(`sliceStart: ${sliceStart}`);
      let sliceEnd = Math.min(visibleSongsAroundInex + halfVisibleRows, this.props.songs.length);
      logger.info(`sliceEnd: ${sliceEnd}`);

      let remaining = sliceEnd - sliceStart;
      logger.info(`would show ${remaining} out of ${this.props.visibleRows} allowed`);
      if (remaining < this.props.visibleRows) {
        logger.info(`adjusting to show more songs in the end`);
        sliceEnd = Math.min(sliceEnd + (this.props.visibleRows - remaining), this.props.songs.length);
        logger.info(`new sliceEnd: ${sliceEnd}`);
      }

      visibleSongs = this.props.songs.slice(sliceStart, sliceEnd);
      logger.info(`total visible songs: ${visibleSongs.length}`);
    }

    return visibleSongs;
  }

  render() {
    loggerCreator("render", moduleLogger);

    let visibleSongs = this.calculateVisibleSongs();

    return (
      <View onLayout={this._onContainerLayout} style={[this.props.style]}>
        <HeaderRow visibleColumns={this.state.visibleColumns} />
        {visibleSongs.map((song, index) => {
          return (
            <SongRow
              key={song.id}
              visibleColumns={this.state.visibleColumns}
              song={song}
              isHighlighted={this.props.highlightedSong === song}
              index={index}
              onPress={this.props.onRowPress}
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
  visibleRows: React.PropTypes.number,

  onRowPress: React.PropTypes.func,
};
