import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("rating");

import React, { Component } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Image, Vibration } from 'react-native';
import Text from './text';
import _ from 'lodash'
import { colors } from '../styles/styles'
import playerProxy from '../native_proxy/player_proxy'

let starFullSource = require("../images/star-full.png");
let starEmptySource = require("../images/star-empty.png");

const MAX_RATING = 100;
const STAR_COUNT = 5;
const RATING_STAR_RATIO = MAX_RATING / STAR_COUNT;

export default class Rating extends Component {

  onStarLongPress(starIndex) {
    let logger = loggerCreator("onStarPress", moduleLogger);
    logger.info(`clicked star ${starIndex}`);

    let newRating = (starIndex+1) * RATING_STAR_RATIO;
    logger.info(`new rating: ${newRating}`);

    logger.info(`updating song ${this.props.songId} with new rating: ${newRating}`);
    playerProxy.updateSongRating(this.props.songId, newRating)
      .then(() => {
        logger.info(`update finished`);
      })
      .catch(e => {
        logger.error(`update failed: ${e}`)
      });

    Vibration.vibrate();
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start - rating: ${this.props.rating}`);

    var highlightedStarCount = this.props.rating / RATING_STAR_RATIO;
    logger.info(`highlighted stars: ${highlightedStarCount}`);

    let stars = _.range(STAR_COUNT).map(i => {
      var imageSource;

      if (i < highlightedStarCount) {
        imageSource = starFullSource;
      } else {
        imageSource = starEmptySource;
      }

      return (
        <TouchableWithoutFeedback key={i} onLongPress={() => this.onStarLongPress(i)}>
          <Image style={[styles.star]} source={imageSource}/>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View style={[styles.container, this.props.style]}>
        {stars}
      </View>
    )

  }
}

Rating.propTypes = {
  rating: React.PropTypes.number.isRequired,
  songId: React.PropTypes.number.isRequired
};

const styles = StyleSheet.create({
  container: {flexDirection: "row"},
  star: {
    marginHorizontal: 2
  }
});
