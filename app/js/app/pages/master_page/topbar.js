import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Topbar");

import React, { Component } from "react";
import { Platform, Image, StyleSheet, TouchableHighlight, View, TouchableOpacity } from "react-native";
import { observer } from "mobx-react";
import NormalText from "../../shared_components/text/normal_text";

import { masterStore } from "app/stores/master_store";
import BigText from "app/shared_components/text/big_text";
import { colors } from "app/styles/styles";
import SmallText from "app/shared_components/text/small_text";
import { dimensionsStore } from "app/stores/dimensions_store";
import { player } from "app/stores/player/player";
import { navigator } from "app/stores/navigator.js";

import hamburgerImage from "app/images/hamburger.png";
import playlistImage from "app/images/playlist-icon.png";
import playImage from "app/images/play.png";
import pauseImage from "app/images/pause.png";
import { routes } from "app/utils/routes";

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
  songInfoTitle: { color: colors.CYAN_BRIGHT },
  songInfoArtist: { fontWeight: "bold", color: colors.CYAN_BRIGHT },
});

@observer
export default class Topbar extends Component {
  onHamburgerPress = () => {
    let logger = loggerCreator("onHamburgerPress", moduleLogger);

    masterStore.isPlaylistSidebarOpen = false;
    masterStore.isNavigationSidebarOpen = !masterStore.isNavigationSidebarOpen;
    logger.info(`navigation sidebar should be now open? ${masterStore.isNavigationSidebarOpen}`);
  };

  onPlaylistPress = () => {
    const logger = loggerCreator("onPlaylistPress", moduleLogger);

    masterStore.isNavigationSidebarOpen = false;
    masterStore.isPlaylistSidebarOpen = !masterStore.isPlaylistSidebarOpen;
    logger.info(`playlist sidebar should be now open? ${masterStore.isPlaylistSidebarOpen}`);
  };

  onPlayPausePress = () => {
    player.playPauseToggle();
  };

  onSongInfoPress = () => {
    navigator.navigateToPlayer();
  };

  render() {
    return (
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={this.onHamburgerPress} activeOpacity={0.5} style={styles.hamburgerContainer}>
            <View style={styles.hamburgerContent}>
              <Image source={hamburgerImage} style={styles.hamburgerImage} />
              {dimensionsStore.isBigWidth ? <BigText style={styles.currentPageText}>Player</BigText> : null}
            </View>
          </TouchableOpacity>
        </View>
        {player.currentSong
          ? <View style={styles.topBarRight}>
              <TouchableHighlight style={styles.playlistButton} onPress={this.onPlaylistPress}>
                <Image resizeMode="contain" source={playlistImage} style={styles.playlistImage} />
              </TouchableHighlight>
              <TouchableHighlight style={styles.playButton} onPress={this.onPlayPausePress}>
                <Image
                  resizeMode="contain"
                  source={player.isPlaying ? pauseImage : playImage}
                  style={styles.playImage}
                />
              </TouchableHighlight>
              {navigator.activeRoute.address !== routes.PLAYER_PAGE
                ? <TouchableHighlight style={styles.songInfo} onPress={this.onSongInfoPress}>
                    <View>
                      <SmallText style={styles.songInfoTitle}>
                        {player.currentSong.title}
                      </SmallText>
                      <SmallText style={styles.songInfoArtist}>
                        {player.currentSong.artist}
                      </SmallText>
                    </View>
                  </TouchableHighlight>
                : <NormalText style={styles.songInfo}>
                    {player.currentPlaylist.name} playlist
                  </NormalText>}
            </View>
          : null}
      </View>
    );
  }
}

Topbar.propTypes = {};
