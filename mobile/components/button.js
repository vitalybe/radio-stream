import React, { Component } from 'react';
import {
  TouchableHighlight,
} from 'react-native';

import { COLORS } from '../styles/styles'

const styles = {
  button: {
    backgroundColor: COLORS.CYAN_DARK.clone().clearer(0.8).rgbString(),
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderColor: COLORS.CYAN_BRIGHT.rgbString(),
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 5,
  }
};

export default class Button extends Component {
  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress}
                          style={[styles.button, this.props.style]}
                          underlayColor={COLORS.CYAN_DARK.clone().clearer(0.5).rgbString()}
                          activeOpacity={1}>
        {this.props.children}
      </TouchableHighlight>
    )

  }
}