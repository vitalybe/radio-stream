import React, { Component } from "react";
import { TouchableHighlight, View } from "react-native";

import { colors } from "../styles/styles";

const styles = {
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 0, // will be calculated during button generation
  },
};

export default class CircleButton extends Component {
  render() {
    var height = this.props.size;
    var width = this.props.size;
    var borderRadius = this.props.size / 2;

    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        style={[styles.button, { height: height, width: width, borderRadius: borderRadius }, this.props.style]}
        underlayColor={colors.CONTAINER_BACKGROUND_ACTIVE}
        activeOpacity={1}>
        <View>
          {this.props.children}
        </View>
      </TouchableHighlight>
    );
  }
}

CircleButton.propTypes = {
  size: React.PropTypes.number.isRequired,
};
