import React, { Component } from "react";
import { Text } from "react-native";

import { colors, fontSizes } from "app/styles/styles";

const styles = {
  text: {
    color: colors.SEMI_WHITE,
    fontSize: fontSizes.SMALL,
  },
};

export default class SmallText extends Component {
  render() {
    return (
      <Text style={[styles.text, this.props.style]} numberOfLines={1}>
        {this.props.children}
      </Text>
    );
  }
}
