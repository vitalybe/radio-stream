import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("stars");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Vibration } from 'react-native';
import Text from './text';
import _ from 'lodash'
import { colors } from '../styles/styles'

let starFullSource = require("../images/star-full.png");
let starEmptySource = require("../images/star-empty.png");

export default class Stars extends Component {

  onStarLongPress(i) {
    let logger = loggerCreator("onStarPress", moduleLogger);
    logger.info(`clicked star ${i}`);

    // Vibration.vibrate();
    this.props.onStarPress(i);
  }

  onStarPress() {
    // Vibration.vibrate();
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    let stars = _.range(5).map(i => {
      var imageSource;

      if (i < this.props.highlighted) {
        imageSource = starFullSource;
      } else {
        imageSource = starEmptySource;
      }

      return (
        <TouchableWithoutFeedback key={i} onPress={() => this.onStarPress()} onLongPress={() => this.onStarLongPress(i)}>
          <Image style={[styles.star]} source={imageSource}/>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View style={styles.container}>
        {stars}
      </View>
    )

  }
}

Stars.propTypes = {
  highlighted: React.PropTypes.number.isRequired,
  onStarPress: React.PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {flexDirection: "row"},
  star: {
    marginHorizontal: 2
  }
});
