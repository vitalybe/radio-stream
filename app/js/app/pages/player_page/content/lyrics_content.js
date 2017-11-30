import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("LyricsContent");

import React, { Component } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { observer } from "mobx-react";
import { autorun } from "mobx";

import BigText from "app/shared_components/text/big_text";
import contentStyle from "./content_style";
import SmallText from "app/shared_components/text/small_text";
import { lyrics } from "app/utils/lyrics/lyrics";

const styles = StyleSheet.create({
  containerView: {
    padding: 10,
  },
  header: {
    marginBottom: 15,
  },
});

@observer
export default class LyricsContent extends Component {
  songWithFoundLyrics = null;

  isSongWithoutLyrics(song) {
    return song !== this.songWithFoundLyrics;
  }

  isMySlideActive(mySlideIndex) {
    return mySlideIndex === this.props.slideNumber;
  }

  async componentWillMount() {
    const logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`this.props.activeSlideIndex: ${this.props.slideNumber}`);
    this.state = { lyrics: "Loading..." };

    await this.ifNeededFindLyrics();
  }

  componentWillUnmount() {
    loggerCreator("componentWillUnmount", moduleLogger);
  }

  async ifNeededFindLyrics(song, activeSlideIndex) {
    const logger = loggerCreator("ifNeededFindLyrics", moduleLogger);
    logger.info(`is this slide active? ${this.isMySlideActive(activeSlideIndex)}`);
    logger.info(`is current song without lyrics? ${this.isSongWithoutLyrics(song)}`);

    if (this.isSongWithoutLyrics(song) && this.isMySlideActive(activeSlideIndex)) {
      await this.findLyrics(song);
      this.songWithFoundLyrics = song;
    }
  }

  async componentWillReceiveProps(nextProps) {
    const logger = loggerCreator("componentWillReceiveProps", moduleLogger);
    logger.info(`nextProps.activeSlideIndex: ${nextProps.activeSlideIndex}`);
    logger.info(`this.props.activeSlideIndex: ${this.props.activeSlideIndex}`);
    if (nextProps.song !== this.props.song || nextProps.activeSlideIndex !== this.props.activeSlideIndex) {
      await this.ifNeededFindLyrics(nextProps.song, nextProps.activeSlideIndex);
    }
  }

  async findLyrics(song) {
    const logger = loggerCreator("findLyrics", moduleLogger);

    let displayedLyrics = "No lyrics were found";

    try {
      let result = await lyrics.find(song);
      if (result) {
        logger.info(`got lyrics`);
        displayedLyrics = result;
      } else {
        logger.info(`no lyrics`);
      }
      this.setState({ lyrics: displayedLyrics });
    } catch (e) {
      logger.error(`failed to get lyrics: ${e}`);
      this.setState({ lyrics: "Failed to load lyrics" });
    }
  }

  render() {
    return (
      <ScrollView horizontal={false} style={[contentStyle.container, this.props.style]}>
        {/* NOTE: The inner components must be surrounded by a <View> to work - Otherwise they wouldn't get
                  the width from ContentSwiper (web). You CAN'T encapsulate the wrapping view inside a component - it
                   must be directly inside ContentSwiper */}
        <View style={styles.containerView}>
          <BigText style={styles.header}>Lyrics</BigText>
          <SmallText numberOfLines={null}>{this.state.lyrics}</SmallText>
        </View>
      </ScrollView>
    );
  }
}

LyricsContent.propTypes = {
  slideNumber: React.PropTypes.number,
  song: React.PropTypes.object.isRequired,
};
