import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SavePlaylistPage");

import React, { Component } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import BigText from "app/shared_components/text/big_text";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import NormalText from "app/shared_components/text/normal_text";
import RectangleButton from "app/shared_components/rectangle_button";
import ButtonText from "app/shared_components/text/button_text";
import { backendMetadataApi } from "app/utils/backend_metadata_api/backend_metadata_api";
import { playlistsStore } from "app/stores/playlists_store";
import { player } from "app/stores/player/player";
import constants from "app/utils/constants";
import { navigator } from "app/stores/navigator";
import LoadingSpinner from "app/shared_components/loading_spinner";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    flex: 1,
  },
  title: {
    marginVertical: 10,
  },
  input: {},
  buttons: {
    marginTop: 20,
    flexDirection: "row",
  },
  backButton: {
    marginLeft: 10,
  },
  spinner: {
    marginTop: 10,
    flex: 1,
  },
});

@observer
export default class SavePlaylistPage extends Component {
  componentWillMount() {
    this.state = {
      playlistName: "",
      saving: false,
    };
  }

  onChangeText = text => {
    this.setState({ playlistName: text });
  };

  onSaveAndPlay = async () => {
    const logger = loggerCreator("onSaveAndPlay", moduleLogger);

    this.setState({ saving: true });
    try {
      await backendMetadataApi.savePlaylist(this.state.playlistName, this.props.query);
      await playlistsStore.updatePlaylists();

      await player.changePlaylist(this.state.playlistName);
      player.play();
      navigator.navigateToPlayer();
    } catch (err) {
      logger.error(`save failed: ${err}`);
      this.setState({ saving: false });
    }
  };

  onBack = () => {
    navigator.navigateToSearch(this.props.query);
  };

  render() {
    if (!this.state.saving) {
      return (
        <View style={styles.container}>
          <BigText style={styles.title}>Query</BigText>
          <NormalText>
            {this.props.query}
          </NormalText>
          <BigText style={styles.title}>Playlist name</BigText>
          <RoundedTextInput style={styles.input} value={this.state.playlistName} onChangeText={this.onChangeText} />
          <View style={styles.buttons}>
            <RectangleButton disabled={!this.state.playlistName} onPress={this.onSaveAndPlay}>
              <ButtonText>Save and play</ButtonText>
            </RectangleButton>
            <RectangleButton style={styles.backButton} onPress={this.onBack}>
              <ButtonText>Back</ButtonText>
            </RectangleButton>
          </View>
        </View>
      );
    } else {
      return <LoadingSpinner message="Saving playlist..." />;
    }
  }
}

SavePlaylistPage.propTypes = {
  query: React.PropTypes.string.isRequired,
};
