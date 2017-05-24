import React, {Component} from 'react';
import {Text} from 'react-native';

import {fontSizes} from '../../styles/styles'
import NormalText from './normal_text'

const styles = {
  text: {
    fontSize: fontSizes.LARGE
  }
};


export default class BigText extends Component {

  render() {

    return (
      <NormalText style={[styles.text, this.props.style]}>
        {this.props.children}
      </NormalText>
    )

  }
}