import React, { Component } from "react";
import { Text } from "react-native";

import { colors, fontSizes } from "app/styles/styles";

const styles = {
  text: {
    color: colors.SEMI_WHITE,
    fontSize: fontSizes.NORMAL,
  },
};

export default class NormalText extends Component {
  render() {
    return (
      <Text style={[styles.text, this.props.style]} numberOfLines={1}>
        {this.props.children}
      </Text>
    );
  }
}
