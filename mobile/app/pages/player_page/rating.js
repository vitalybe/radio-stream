import loggerCreator from '../../utils/logger'
var moduleLogger = loggerCreator("rating");

import React, {Component} from 'react';
import {StyleSheet, View, TouchableWithoutFeedback, Image, Vibration, ToastAndroid, Platform} from 'react-native';
import _ from 'lodash'
import {observer} from "mobx-react"

import BackendMetadataApi from '../../utils/backend_metadata_api'

let starFullSource = require("../../images/star-full.png");
let starEmptySource = require("../../images/star-empty.png");

const MAX_RATING = 100;
const STAR_COUNT = 5;
const RATING_STAR_RATIO = MAX_RATING / STAR_COUNT;

const styles = StyleSheet.create({
  container: {flexDirection: "row"},
  star: {
    marginHorizontal: 2,
    height: 50,
    width: 53,
  }
});

@observer
export default class Rating extends Component {

  async _changeRating(starIndex) {
    let logger = loggerCreator("onStarPress", moduleLogger);

    try {
      logger.info(`clicked star ${starIndex}`);

      let newRating = (starIndex + 1) * RATING_STAR_RATIO;
      logger.info(`new rating: ${newRating}`);

      logger.info(`updating song ${this.props.song.id} with new rating: ${newRating}`);
      this.props.song.rating = newRating;
      await BackendMetadataApi.updateRating(this.props.song.id, newRating);
      logger.info(`update finished`);

      Vibration.vibrate(500);
    } catch (e) {
      logger.error(`update failed: ${e}`)
    }
  }

  onStarLongPress(starIndex) {
    this._changeRating(starIndex);
  }

  onStarPress(starIndex) {
    if (Platform.OS === 'web') {
      this._changeRating(starIndex);
    } else {
      ToastAndroid.show('Long press to change rating', ToastAndroid.SHORT);
    }
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`rating: ${this.props.song.rating}`);

    var highlightedStarCount = this.props.song.rating / RATING_STAR_RATIO;
    logger.info(`highlighted stars: ${highlightedStarCount}`);

    let stars = _.range(STAR_COUNT).map(i => {
      var imageSource;

      if (i < highlightedStarCount) {
        imageSource = starFullSource;
      } else {
        imageSource = starEmptySource;
      }

      return (
        <TouchableWithoutFeedback key={i}
                                  onPress={() => this.onStarPress(i)}
                                  onLongPress={() => this.onStarLongPress(i)}>
          <View><Image style={[styles.star]} source={imageSource}/></View>
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
  song: React.PropTypes.object.isRequired
};