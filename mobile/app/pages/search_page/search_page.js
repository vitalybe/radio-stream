import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SearchPage");

import React, { Component } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View, Platform } from "react-native";
import { observer } from "mobx-react";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import BigText from "app/shared_components/text/big_text";
import RectangleButton from "app/shared_components/rectangle_button";
import NormalText from "app/shared_components/text/normal_text";
import ButtonText from "app/shared_components/text/button_text";
import { colors } from "app/styles/styles";
import SongsGrid from "app/shared_components/songs_grid/songs_grid";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import { playlistsStore } from "app/stores/playlists_store";
import { navigator } from "app/stores/navigator";
import constants from "app/utils/constants";
import { player } from "app/stores/player/player";
import Keyboard from "app/utils/keyboard/kebyoard";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  queryContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: { paddingHorizontal: 20 },
  searchResult: {
    flex: 1,

    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,

    marginTop: 10,
    padding: 10,
  },
  buttons: {
    marginTop: 10,
    flexDirection: "row",
  },
  button: {
    ...Platform.select({
      android: {
        flex: 1,
      },
    }),
  },
  playResultsButton: {
    marginRight: 10,
  },
});

@observer
export default class SearchPage extends Component {
  componentWillMount() {
    this.state = {
      isSearching: false,
      songs: [],
      query: this.props.query || "",
      playlistName: this.props.playlistName || "",
    };
  }

  componentDidMount() {
    if (this.state.query) {
      this.search();
    }
  }

  onInputKeypress = async event => {
    if (event.key === "Enter") {
      // noinspection JSIgnoredPromiseFromCall
      this.search();
    }
  };

  search = async () => {
    const logger = loggerCreator("search", moduleLogger);
    Keyboard.dismiss();

    this.setState({ isSearching: true });
    logger.info(`searching for: ${this.state.query}`);
    let songs = await backendMetadataApi.querySongs(this.state.query);
    logger.info(`got results: ${songs.length}`);
    this.setState({ songs: songs, isSearching: false });
  };

  onPlayResults = async () => {
    await backendMetadataApi.savePlaylist(constants.SEARCH_RESULT_PLAYLIST, this.state.query);
    await playlistsStore.updatePlaylists();

    await player.changePlaylist(constants.SEARCH_RESULT_PLAYLIST);
    player.play();
    navigator.navigateToPlayer();
  };

  onChangeText = text => {
    this.setState({ query: text });
  };

  onSaveAsPlaylist = () => {
    navigator.navigateToSavePlaylistPage(this.state.query);
  };

  render() {
    return (
      <View style={styles.container}>
        <BigText style={{ flexShrink: 0 }}>Query</BigText>
        <View style={styles.queryContainer}>
          <RoundedTextInput
            value={this.state.query}
            onChangeText={this.onChangeText}
            style={styles.input}
            onKeyPress={this.onInputKeypress}
          />
          <RectangleButton style={[styles.searchButton]} onPress={this.search}>
            <ButtonText>Search</ButtonText>
          </RectangleButton>
        </View>
        <ScrollView horizontal={false} style={styles.searchResult}>
          {this.state.isSearching ? <ActivityIndicator size="large" /> : <SongsGrid songs={this.state.songs} />}
        </ScrollView>
        <View style={styles.buttons}>
          <RectangleButton
            style={[styles.button, styles.playResultsButton]}
            disabled={this.state.songs.length < 1}
            onPress={this.onPlayResults}>
            <ButtonText>Play results</ButtonText>
          </RectangleButton>
          <RectangleButton style={styles.button} onPress={this.onSaveAsPlaylist} disabled={this.state.songs.length < 1}>
            <ButtonText>Save as playlist</ButtonText>
          </RectangleButton>
        </View>
      </View>
    );
  }
}

SearchPage.propTypes = {
  query: React.PropTypes.string,
};
