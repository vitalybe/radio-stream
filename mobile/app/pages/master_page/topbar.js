import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Topbar");

import React, { Component } from "react";
import { Platform, Image, StyleSheet, TouchableHighlight, View } from "react-native";
import { observer } from "mobx-react";
import NormalText from "../../shared_components/text/normal_text";

import masterStore from "app/stores/master_store";
import BigText from "app/shared_components/text/big_text";
import { colors } from "app/styles/styles";
import SmallText from "app/shared_components/text/small_text";

import hamburgerImage from "app/images/hamburger.png";
import playlistImage from "app/images/playlist-icon.png";
import playImage from "app/images/play.png";
import { dimensionsStoreInstance } from "app/stores/dimensions_store";
import player from "app/stores/player/player";

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    margin: 10,
  },
  topBarLeft: {
    flex: 0.2,
    flexDirection: "row",
    ...Platform.select({
      web: {
        minWidth: "-webkit-min-content",
      },
    }),
  },
  hamburgerContainer: {},
  hamburgerContent: { flexDirection: "row", alignItems: "center" },
  hamburgerImage: {
    height: 30,
    width: 34,
    marginRight: 10,
  },
  currentPageText: { color: colors.CYAN_BRIGHT },
  topBarRight: {
    flex: 0.8,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  playlistButton: {},
  playlistImage: { height: 34, width: 30 },
  playButton: { marginRight: 10 },
  playImage: { height: 25, width: 20 },

  songInfo: {
    alignItems: "flex-start",
    marginRight: 10,
    flexShrink: 1,
  },
  songInfoTitle: {},
  songInfoArtist: { fontWeight: "bold" },
});

@observer
export default class Topbar extends Component {
  onHamburgerClick = () => {
    let logger = loggerCreator("onHamburgerClick", moduleLogger);

    masterStore.isNavigationSidebarOpen = !masterStore.isNavigationSidebarOpen;
    logger.info(`navigation sidebar should be now open? ${masterStore.isNavigationSidebarOpen}`);
  };

  onPlaylistClick = () => {
    const logger = loggerCreator("onPlaylistClick", moduleLogger);

    masterStore.isPlaylistSidebarOpen = !masterStore.isPlaylistSidebarOpen;
    logger.info(`playlist sidebar should be now open? ${masterStore.isPlaylistSidebarOpen}`);
  };

  render() {
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableHighlight onPress={this.onHamburgerClick} style={styles.hamburgerContainer}>
            <View style={styles.hamburgerContent}>
              <Image source={hamburgerImage} style={styles.hamburgerImage} />
              {dimensionsStoreInstance.isBigWidth ? <BigText style={styles.currentPageText}>Player</BigText> : null}
            </View>
          </TouchableHighlight>
        </View>
        {player.currentPlaylist
          ? <View style={styles.topBarRight}>
              <TouchableHighlight style={styles.playlistButton} onPress={this.onPlaylistClick}>
                <Image resizeMode="contain" source={playlistImage} style={styles.playlistImage} />
              </TouchableHighlight>
              <TouchableHighlight style={styles.playButton}>
                <Image resizeMode="contain" source={playImage} style={styles.playImage} />
              </TouchableHighlight>
              <View style={styles.songInfo}>
                <SmallText style={styles.songInfoTitle}>The lamb lies down on Broadway</SmallText>
                <SmallText style={styles.songInfoArtist}>Genesis</SmallText>
              </View>
            </View>
          : null}
      </View>
    );
  }
}

Topbar.propTypes = {};
