import React, { Component } from 'react';
import { Text } from 'react-native';

import { colors, fontSizes } from '../../styles/styles'

const styles = {
  text: {
    color: colors.SEMI_WHITE,
    fontSize: fontSizes.NORMAL
  }
};

export default class ButtonText extends Component {

  // Needed per: https://facebook.github.io/react-native/docs/direct-manipulation.html
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {

    return (
      <Text {...this.props} ref={component => this._root = component} style={[styles.text, this.props.style]}>
        {this.props.children}
      </Text>
    )

  }
}