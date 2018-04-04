import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("PlaylistNamePart");

import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { observer } from "mobx-react";
import BigText from "app/shared_components/text/big_text";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import NormalText from "app/shared_components/text/normal_text";
import RectangleButton from "app/shared_components/rectangle_button";
import ButtonText from "app/shared_components/text/button_text";
import { navigator } from "app/stores/navigator";

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
export default class PlaylistNamePart extends Component {
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
    this.props.onSaveAndPlay(this.state.playlistName, this.props.query);
  };

  onBack = () => {
    navigator.navigateToSearch(this.props.query);
  };

  render() {
    if (!this.state.saving) {
      return (
        <View style={styles.container}>
          <BigText style={styles.title}>Query</BigText>
          <NormalText>{this.props.query}</NormalText>
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
    }
  }
}

PlaylistNamePart.propTypes = {
  query: React.PropTypes.string.isRequired,
  onSaveAndPlay: React.PropTypes.func.isRequired,
};
