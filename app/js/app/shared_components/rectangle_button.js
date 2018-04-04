import React, { Component } from "react";
import { TouchableHighlight } from "react-native";

import { colors } from "app/styles/styles";

const styles = {
  button: {
    alignItems: "center",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    paddingHorizontal: 10,
    height: 50,
    justifyContent: "center",
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
  },
  disabled: {
    opacity: 0.2,
  },
};

export default class RectangleButton extends Component {
  render() {
    let { onPress, style, children, ...otherProps } = this.props;

    return (
      <TouchableHighlight
        onPress={onPress}
        style={[styles.button, style, this.props.disabled ? styles.disabled : null]}
        underlayColor={colors.CONTAINER_BACKGROUND_ACTIVE}
        activeOpacity={1}
        {...otherProps}>
        {children}
      </TouchableHighlight>
    );
  }
}
