import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("player_page");

import React, { Component } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";

import { masterStore } from "app/stores/master_store";
import settings from "app/utils/settings/settings";
import { colors } from "app/styles/styles";
import PlayerContextMenu from "./player_context_menu";
import { player } from "app/stores/player/player";
import Rating from "../../shared_components/rating";
import PlayerControls from "./player_controls";
import LoadingSpinner from "../../shared_components/loading_spinner";
import SongDetails from "app/pages/player_page/song_details";
import NoPlaylistSelected from "app/pages/player_page/no_playlist_selected";
import ContentSwiper from "../../utils/content_swiper/content_swiper";
import AlbumArtContent from "./content/album_art_content";
import MetadataContent from "./content/metadata_content";
import LyricsContent from "app/pages/player_page/content/lyrics_content";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: "center",
    alignSelf: "stretch",
  },
  loadedPlaylistContainer: {
    flex: 1,
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
  contentSwiperContainer: {
    flex: 1,
    marginBottom: 20,
  },
  contentSwiperSlideContainer: {
    ...Platform.select({
      android: {
        flex: 1,
      },
    }),
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
  async componentWillMount() {
    loggerCreator("componentWillMount", moduleLogger);

    // MOCK: Starts playing automatically
    if (settings.values.isMock && settings.values.isMockStartPlaying) {
      await player.changePlaylist("mock");
      masterStore.closeSidebars();
      player.play();
    }
  }

  componentDidMount() {
    loggerCreator("componentDidMount", moduleLogger);
  }

  componentWillUnmount() {
    loggerCreator("componentWillUnmount", moduleLogger);
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);

    const song = player.currentSong;
    logger.info(`rendering song: ${song && song.toString()}`);

    return (
      <View style={styles.container}>
        {(() => {
          if (!player.currentPlaylist) {
            return <NoPlaylistSelected />;
          } else if (player.isLoading) {
            return <LoadingSpinner message={`Loading playlist: ${player.currentPlaylist.name}`} song={song} />;
          } else {
            return (
              <View style={styles.loadedPlaylistContainer}>
                <View style={[styles.contentSwiperContainer]}>
                  <ContentSwiper>
                    <AlbumArtContent song={song} />
                    <MetadataContent song={song} />
                    <LyricsContent song={song} />
                  </ContentSwiper>
                </View>
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
            );
          }
        })()}
      </View>
    );
  }
}

PlayerPage.propTypes = {};
