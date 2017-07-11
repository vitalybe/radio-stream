import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SongsGrid");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "app/shared_components/text/normal_text";
import SmallText from "app/shared_components/text/small_text";

import playImage from "app/images/play.png";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
  },
  nameCell: {
    flex: 0.9,
  },
  headerText: {
    fontWeight: "bold",
  },
  gridCell: {
    flex: 0.1,
    flexBasis: "0%",
    minWidth: 120,

    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
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
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <NormalText style={[styles.gridCell, styles.nameCell, styles.headerText]}>Name</NormalText>
          <NormalText style={[styles.gridCell, styles.headerText]}>Rating</NormalText>
          <NormalText style={[styles.gridCell, styles.headerText]}>Last played</NormalText>
          <NormalText style={[styles.gridCell, styles.headerText]}>Play count</NormalText>
        </View>
        <View style={styles.row}>
          <View style={[styles.gridCell, styles.nameCell]}>
            <Image source={playImage} style={styles.playImage} />
            <View style={styles.nameContainer}>
              <SmallText>Title</SmallText>
              <SmallText style={styles.artistText}>Artist</SmallText>
            </View>
          </View>
          <View style={[styles.gridCell]}>
            <SmallText>**oo.</SmallText>
          </View>
          <View style={[styles.gridCell]}>
            <SmallText>Just now</SmallText>
          </View>
          <View style={[styles.gridCell]}>
            <SmallText>35</SmallText>
          </View>
        </View>
      </View>
    );
  }
}

SongsGrid.propTypes = {};
