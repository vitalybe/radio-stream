import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("SettingsTextInput");

import React, { Component, PropTypes } from "react";
import { Image, StyleSheet, Text, View, TextInput } from "react-native";

import NormalText from "app/shared_components/text/normal_text";
import { colors } from "app/styles/styles";

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },

  input: {
    height: 50,

    color: colors.SEMI_WHITE,
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,

    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,

    padding: 10,
    marginBottom: 25,
  },
});

export default class SettingsTextInput extends Component {
  render() {
    return (
      <View>
        <NormalText style={[styles.label]}>
          {this.props.label}
        </NormalText>
        <TextInput
          style={[styles.input]}
          value={this.props.value}
          onChangeText={this.props.onChangeText}
          {...this.props.textInputProps}
        />
      </View>
    );
  }
}

SettingsTextInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func,

  textInputProps: PropTypes.object,
};
