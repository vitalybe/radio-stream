import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("player_page");

import React, { Component } from "react";
import { StyleSheet, View, Image } from "react-native";
import BackHandler from "app/utils/back_handler/back_handler";
import { observer } from "mobx-react";

import { colors } from "app/styles/styles";
import PlayerContextMenu from "./player_context_menu";
import navigator from "app/stores/navigator/navigator";
import player from "app/stores/player/player";
import Rating from "../../shared_components/rating";
import AlbumArt from "./album_art";
import PlayerControls from "./player_controls";
import PlayerLoadingSpinner from "./player_loading_spinner";
import NormalText from "app/shared_components/text/normal_text";
import SongDetails from "app/pages/player_page/song_details";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: "center",
    alignSelf: "stretch",
  },
  // Playlist name
  playlistNameView: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 10,
    paddingTop: 5,
    paddingLeft: 5,
  },
  playlistIcon: {
    color: colors.SEMI_WHITE,
    marginRight: 5,
  },
  // Sections
  albumArt: {
    marginBottom: 20,
    flex: 1,
  },
  rating: {
    marginBottom: 20,
    paddingHorizontal: 10,
    alignSelf: "center",
  },
  songDetails: {
    marginBottom: 15,
  },
});

@observer
export default class PlayerPage extends Component {
  componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`playlist: ${this.props.playlistName}`);

    BackHandler.addEventListener("hardwareBackPress", () => this.onPressHardwareBack());
  }

  componentDidMount() {
    loggerCreator("componentDidMount", moduleLogger);
  }

  componentWillUnmount() {
    loggerCreator("componentWillUnmount", moduleLogger);
  }

  onPressHardwareBack() {
    loggerCreator("hardwareBackPress", moduleLogger);
    player.pause();
    navigator.navigateToNoPlaylistSelected();
    return true;
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);

    const song = player.currentSong;
    logger.info(`rendering song: ${song && song.toString()}`);

    return (
      <View style={styles.container}>
        {!player.isLoading
          ? <View style={{ flex: 1 }}>
              {/* Album art */}
              <AlbumArt style={[styles.albumArt]} song={song} />
              {/* Ratings */}
              <View style={styles.rating}>
                <Rating song={song} starSize={43} starMargin={5} canChangeRating={true} />
                <PlayerContextMenu song={song} />
              </View>
              {/* Names */}
              <SongDetails song={song} style={styles.songDetails} />
              {/* Controls */}
              <PlayerControls />
            </View>
          : <PlayerLoadingSpinner song={song} />}
      </View>
    );
  }
}

PlayerPage.propTypes = {
  playlistName: React.PropTypes.string.isRequired,
};
