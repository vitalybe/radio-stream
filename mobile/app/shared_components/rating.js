import loggerCreator from "app/utils/logger";
var moduleLogger = loggerCreator("rating");

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Vibration,
  ToastAndroid,
  Platform,
  Text,
} from "react-native";
import _ from "lodash";
import { observer } from "mobx-react";

import BackendMetadataApi from "app/utils/backend_metadata_api";

let starFullSource = require("app/images/star-full.png");
let starEmptySource = require("app/images/star-empty.png");

const MAX_RATING = 100;
const STAR_COUNT = 5;
const RATING_STAR_RATIO = MAX_RATING / STAR_COUNT;

const styles = StyleSheet.create({
  container: { flexDirection: "row", justifyContent: "center" },
  star: {
    resizeMode: "contain",
  },
});

@observer
export default class Rating extends Component {
  async _changeRating(starIndex) {
    let logger = loggerCreator("onStarPress", moduleLogger);

    try {
      logger.info(`clicked star ${starIndex}`);

      let newRating = (starIndex + 1) * RATING_STAR_RATIO;
      await this.props.song.actions.changeRating(newRating);

      Vibration.vibrate(500);
    } catch (e) {
      logger.error(`update failed: ${e}`);
    }
  }

  onStarLongPress(starIndex) {
    this._changeRating(starIndex);
  }

  onStarPress(starIndex) {
    if (Platform.OS === "web") {
      this._changeRating(starIndex);
    } else {
      ToastAndroid.show("Long press to change rating", ToastAndroid.SHORT);
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
        <TouchableWithoutFeedback
          key={i}
          onPress={() => this.onStarPress(i)}
          onLongPress={() => this.onStarLongPress(i)}>
          <View>
            <Image
              style={[
                styles.star,
                {
                  marginHorizontal: this.props.starMargin,
                  height: this.props.starSize,
                  width: this.props.starSize,
                },
              ]}
              source={imageSource}
            />
          </View>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View style={[styles.container, this.props.style]}>
        {stars}
      </View>
    );
  }
}

Rating.propTypes = {
  song: React.PropTypes.object.isRequired,
  starMargin: React.PropTypes.number.isRequired,
  starSize: React.PropTypes.number.isRequired,
};
