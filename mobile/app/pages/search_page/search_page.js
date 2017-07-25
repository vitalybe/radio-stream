import loggerCreator from "../../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SearchPage");

import React, { Component } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from "react-native";
import { observer } from "mobx-react";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import BigText from "app/shared_components/text/big_text";
import RectangleButton from "app/shared_components/rectangle_button";
import NormalText from "app/shared_components/text/normal_text";
import ButtonText from "app/shared_components/text/button_text";
import { colors } from "app/styles/styles";
import SongsGrid from "app/shared_components/songs_grid/songs_grid";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";

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
  searchButton: {},
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
    justifyContent: "flex-end",
    marginTop: 10,
    flexDirection: "row",
  },
  button: {
    paddingHorizontal: 10,
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
    };
  }

  // TEMP
  componentDidMount() {
    this.onSearch();
  }

  onInputKeypress = async event => {
    if (event.key === "Enter") {
      // noinspection JSIgnoredPromiseFromCall
      this.onSearch();
    }
  };

  onSearch = async () => {
    this.setState({ isSearching: true });
    let songs = await backendMetadataApi.querySongs();
    this.setState({ songs: songs, isSearching: false });
  };

  render() {
    return (
      <View style={styles.container}>
        <BigText>Query</BigText>
        <View style={styles.queryContainer}>
          <RoundedTextInput style={styles.input} onKeyPress={this.onInputKeypress} />
          <RectangleButton style={[styles.button, styles.searchButton]} onPress={this.onSearch}>
            <ButtonText>Search</ButtonText>
          </RectangleButton>
        </View>
        <ScrollView horizontal={false} style={styles.searchResult}>
          {this.state.isSearching ? <ActivityIndicator size="large" /> : <SongsGrid songs={this.state.songs} />}
        </ScrollView>
        <View style={styles.buttons}>
          <RectangleButton style={[styles.button, styles.playResultsButton]}>
            <ButtonText>Play results</ButtonText>
          </RectangleButton>
          <RectangleButton style={styles.button}>
            <ButtonText>Save as playlist</ButtonText>
          </RectangleButton>
        </View>
      </View>
    );
  }
}

SearchPage.propTypes = {};
