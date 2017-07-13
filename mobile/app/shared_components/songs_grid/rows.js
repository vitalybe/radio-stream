import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongsGrid");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Platform } from "react-native";
import { observer } from "mobx-react";
import moment from "moment";
import NormalText from "app/shared_components/text/normal_text";
import SmallText from "app/shared_components/text/small_text";

import playImage from "app/images/play.png";
import Rating from "app/shared_components/rating";

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

export class HeaderRow extends Component {
  render() {
    return (
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
        ].slice(0, this.props.visibleColumns)}
      </View>
    );
  }
}

HeaderRow.propTypes = {
  visibleColumns: React.PropTypes.number.isRequired,
};

@observer
export class SongRow extends Component {
  render() {
    return (
      <View style={styles.row}>
        {[
          <View key="name" style={[styles.gridCell, styles.nameCell]}>
            <Image source={playImage} style={styles.playImage} />
            <View style={styles.nameContainer}>
              <SmallText>
                {this.props.song.title}
              </SmallText>
              <SmallText style={styles.artistText}>
                {this.props.song.artist}
              </SmallText>
            </View>
          </View>,
          <View key="rating" style={[styles.gridCell]}>
            <Rating song={this.props.song} starSize={18} starMargin={2} canChangeRating={false} />
          </View>,
          <View key="lastPlayed" style={[styles.gridCell]}>
            <SmallText>
              {moment.unix(this.props.song.lastplayed).fromNow()}
            </SmallText>
          </View>,
          <View key="playCount" style={[styles.gridCell]}>
            <SmallText>
              {this.props.song.playcount}
            </SmallText>
          </View>,
        ].slice(0, this.props.visibleColumns)}
      </View>
    );
  }
}

SongRow.propTypes = {
  visibleColumns: React.PropTypes.number.isRequired,
  song: React.PropTypes.object.isRequired,
};
