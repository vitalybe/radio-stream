import React, { Component } from 'react';
import {
  TouchableHighlight,
} from 'react-native';

import { colors } from '../styles/styles'

const styles = {
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.CYAN_DARK.clone().clearer(0.5).rgbString(),
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderColor: colors.CYAN_BRIGHT.rgbString(),
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 0, // will be calculated during button generation
  }
};

export default class RectangleButton extends Component {
  render() {

    var height = this.props.size;
    var width = this.props.size;
    var borderRadius = this.props.size / 2;

    return (
      <TouchableHighlight onPress={this.props.onPress}
                          style={[styles.button, {height: height, width: width, borderRadius: borderRadius}, this.props.style]}
                          underlayColor={colors.CYAN_DARK.clone().clearer(0.2).rgbString()}
                          activeOpacity={1}>
        <View>
          {this.props.children}
        </View>
      </TouchableHighlight>
    )

  }
}

RectangleButton.propTypes = {
  size: React.PropTypes.number.isRequired
};
