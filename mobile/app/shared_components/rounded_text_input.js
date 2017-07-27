import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("TextInput");

import React, { Component, PropTypes } from "react";
import { Image, StyleSheet, Text, View, TextInput } from "react-native";

import NormalText from "app/shared_components/text/normal_text";
import { colors } from "app/styles/styles";

const styles = StyleSheet.create({
  input: {
    color: colors.SEMI_WHITE,
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    paddingHorizontal: 10,

    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
    height: 50,
  },
});

export default class RoundedTextInput extends Component {
  componentWillMount() {
    this.state = {
      value: this.props.initialValue ? this.props.initialValue : "",
    };
  }

  render() {
    return (
      <TextInput
        {...this.props}
        style={[styles.input, this.props.style]}
        value={this.props.value}
        onChangeText={this.props.onChangeText}
      />
    );
  }
}

TextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
};
