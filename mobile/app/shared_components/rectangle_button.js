import React, { Component } from "react";
import { TouchableHighlight } from "react-native";

import { colors } from "app/styles/styles";

const styles = {
  button: {
    alignItems: "center",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
  },
};

export default class RectangleButton extends Component {
  render() {
    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        style={[styles.button, this.props.style]}
        underlayColor={colors.CONTAINER_BACKGROUND_ACTIVE}
        activeOpacity={1}>
        {this.props.children}
      </TouchableHighlight>
    );
  }
}
