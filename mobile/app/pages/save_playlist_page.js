import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SavePlaylistPage");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { observer } from "mobx-react";
import BigText from "app/shared_components/text/big_text";
import RoundedTextInput from "app/shared_components/rounded_text_input";
import NormalText from "app/shared_components/text/normal_text";
import RectangleButton from "app/shared_components/rectangle_button";
import ButtonText from "app/shared_components/text/button_text";

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
});

@observer
export default class SavePlaylistPage extends Component {
  componentWillMount() {
    this.state = {
      playlistName: "",
    };
  }

  onChangeText = text => {
    this.setState({ playlistName: text });
  };

  render() {
    return (
      <View style={styles.container}>
        <BigText style={styles.title}>Query</BigText>
        <NormalText>joanna newsom</NormalText>
        <BigText style={styles.title}>Playlist name</BigText>
        <RoundedTextInput style={styles.input} value={this.state.playlistName} onChangeText={this.onChangeText} />
        <View style={styles.buttons}>
          <RectangleButton>
            <ButtonText>Save and play</ButtonText>
          </RectangleButton>
          <RectangleButton style={styles.backButton}>
            <ButtonText>Back</ButtonText>
          </RectangleButton>
        </View>
      </View>
    );
  }
}

SavePlaylistPage.propTypes = {};
