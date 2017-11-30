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
import { masterStore } from "app/stores/master_store";

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
  songChangedAfterFindingLyrics = true;

  isMySlideActive() {
    return masterStore.activeSlideIndex === this.props.slideNumber;
  }

  disposeOnActiveSlideChanges = autorun(async () => {
    const logger = loggerCreator("autorun", moduleLogger);

    logger.info(`slide changed: ${masterStore.activeSlideIndex}`);
    if (this.isMySlideActive()) {
      await this.ifNeededFindLyrics();
    }
  });

  async componentWillMount() {
    loggerCreator("componentWillMount", moduleLogger);
    this.state = { lyrics: "Loading..." };

    await this.ifNeededFindLyrics();
  }

  componentWillUnmount() {
    this.disposeOnActiveSlideChanges();
  }

  async ifNeededFindLyrics() {
    const logger = loggerCreator("ifNeededFindLyrics", moduleLogger);
    logger.info(`is this slide active? ${this.isMySlideActive()}`);
    logger.info(`did song change since fetching lyrics? ${this.songChangedAfterFindingLyrics}`);

    if (this.songChangedAfterFindingLyrics && this.isMySlideActive()) {
      await this.findLyrics();
      this.songChangedAfterFindingLyrics = false;
    }
  }

  async componentWillReceiveProps(nextProps) {
    const logger = loggerCreator("componentWillReceiveProps", moduleLogger);
    if (nextProps.song !== this.props.song) {
      logger.info(`song changed`);
      this.songChangedAfterFindingLyrics = true;
      await this.ifNeededFindLyrics();
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
