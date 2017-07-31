import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SearchPart");

import React, { Component } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View, Platform } from "react-native";
import { observer } from "mobx-react";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import BigText from "app/shared_components/text/big_text";
import RectangleButton from "app/shared_components/rectangle_button";
import ButtonText from "app/shared_components/text/button_text";
import { colors } from "app/styles/styles";
import SongsGrid from "app/shared_components/songs_grid/songs_grid";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import constants from "app/utils/constants";
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
  firstButton: {
    marginRight: 10,
  },
});

@observer
export default class SearchPart extends Component {
  prepareComponentState(props) {
    this.setState({
      isSearching: false,
      songs: [],
      query: props.initialQuery || "",
    });

    if (props.initialQuery) {
      // noinspection JSIgnoredPromiseFromCall
      this.search(props.initialQuery);
    }
  }

  componentWillMount() {
    const logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`props: ${JSON.stringify(this.props)}`);

    this.prepareComponentState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const logger = loggerCreator("componentWillReceiveProps", moduleLogger);
    logger.info(`props: ${JSON.stringify(this.props)}`);

    this.prepareComponentState(nextProps);
  }

  onInputKeypress = async event => {
    if (event.key === "Enter") {
      // noinspection JSIgnoredPromiseFromCall
      this.search(this.state.query);
    }
  };

  onSearchPress = async () => {
    // noinspection JSIgnoredPromiseFromCall
    this.search(this.state.query);
  };

  search = async query => {
    const logger = loggerCreator("search", moduleLogger);
    Keyboard.dismiss();

    this.setState({ isSearching: true });
    logger.info(`searching for: ${query}`);
    let songs = await backendMetadataApi.querySongs(query);
    logger.info(`got results: ${songs.length}`);
    this.setState({ songs: songs, isSearching: false });
  };

  onChangeText = text => {
    this.setState({ query: text });
  };

  onSaveAsPlaylist = async () => {
    loggerCreator("onSaveAsPlaylist", moduleLogger);
    await this.props.onSaveAndPlay(this.props.playlistName, this.state.query);
  };

  onPlayResults = async () => {
    await this.props.onSaveAndPlay(constants.SEARCH_RESULT_PLAYLIST, this.state.query);
  };

  onDeletePlaylist = async () => {
    await this.props.onDeletePlaylist(this.props.playlistName);
  };

  render() {
    return (
      <View style={styles.container}>
        <BigText style={{ flexShrink: 0 }}>
          {this.props.playlistName ? `Playlist "${this.props.playlistName}" query` : "Query"}
        </BigText>
        <View style={styles.queryContainer}>
          <RoundedTextInput
            value={this.state.query}
            onChangeText={this.onChangeText}
            style={styles.input}
            onKeyPress={this.onInputKeypress}
          />
          <RectangleButton style={[styles.searchButton]} onPress={this.onSearchPress}>
            <ButtonText>Search</ButtonText>
          </RectangleButton>
        </View>
        <ScrollView horizontal={false} style={styles.searchResult}>
          {this.state.isSearching ? <ActivityIndicator size="large" /> : <SongsGrid songs={this.state.songs} />}
        </ScrollView>
        <View style={styles.buttons}>
          {this.props.playlistName
            ? <RectangleButton style={[styles.button, styles.firstButton]} onPress={this.onDeletePlaylist}>
                <ButtonText>Delete playlist</ButtonText>
              </RectangleButton>
            : <RectangleButton
                style={[styles.button, styles.firstButton]}
                disabled={this.state.songs.length < 1}
                onPress={this.onPlayResults}>
                <ButtonText>Play results</ButtonText>
              </RectangleButton>}
          <RectangleButton style={styles.button} onPress={this.onSaveAsPlaylist} disabled={this.state.songs.length < 1}>
            <ButtonText>
              {this.props.playlistName ? "Update playlist" : "Save as playlist"}
            </ButtonText>
          </RectangleButton>
        </View>
      </View>
    );
  }
}

SearchPart.propTypes = {
  initialQuery: React.PropTypes.string,
  playlistName: React.PropTypes.string,

  onSaveAndPlay: React.PropTypes.func.isRequired,
  onDeletePlaylist: React.PropTypes.func.isRequired,
};
