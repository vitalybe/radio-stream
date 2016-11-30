import React, { Component } from 'react';
import { Text } from 'react-native';

import { colors } from '../styles/styles'

const styles = {
  text: {
    color: colors.SEMI_WHITE.rgbString(),
    fontSize: 15
  }
};

export default class CustomText extends Component {

  // Needed per: https://facebook.github.io/react-native/docs/direct-manipulation.html
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {

    return (
      <Text ref={component => this._root = component} style={[styles.text, this.props.style]} {...this.props}>
        {this.props.children}
      </Text>
    )

  }
}