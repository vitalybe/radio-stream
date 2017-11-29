import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("LyricsContent");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import { observer } from "mobx-react";
import scrapeIt from "scrape-it";

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
  async componentWillMount() {
    loggerCreator("componentWillMount", moduleLogger);
    await this.findLyrics(this.props.song);
  }

  async componentWillReceiveProps(nextProps) {
    loggerCreator("componentWillReceiveProps", moduleLogger);
    if (nextProps.song !== this.props.song) {
      await this.findLyrics(nextProps.song);
    }
  }

  async findLyrics(song) {
    const logger = loggerCreator("findLyrics", moduleLogger);

    this.setState({ lyrics: "Loading..." });
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
        <View style={styles.containerView}>
          <BigText style={styles.header}>Lyrics</BigText>
          <SmallText numberOfLines={null}>{this.state.lyrics}</SmallText>
        </View>
      </ScrollView>
    );
  }
}

LyricsContent.propTypes = {
  song: React.PropTypes.object.isRequired,
};
