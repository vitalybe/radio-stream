import React, { Component } from 'react';
import {
  TouchableHighlight,
} from 'react-native';

import { colors } from '../styles/styles'

const styles = {
  button: {
    alignItems: "center",
    backgroundColor: colors.CYAN_DARK_CLEARER,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
  }
};

export default class RectangleButton extends Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress}
                          style={[styles.button, this.props.style]}
                          underlayColor={colors.CYAN_DARK_CLEAR}
                          activeOpacity={1}>
        {this.props.children}
      </TouchableHighlight>
    )

  }
}