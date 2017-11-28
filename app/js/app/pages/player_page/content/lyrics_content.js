import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("LyricsContent");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import { observer } from "mobx-react";
import scrapeIt from "scrape-it";

import NormalText from "app/shared_components/text/normal_text";
import BigText from "app/shared_components/text/big_text";
import contentStyle from "./content_style";
import { googleSearch } from "app/utils/google_search";

const styles = StyleSheet.create({
  container: {
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

    this.state = { lyrics: "Loading..." };
    let lyrics = "No lyrics were found";

    const query = `site:genius.com ${song.artist} ${song.title}`;
    logger.info(`querying google: ${query}`);
    try {
      const href = await googleSearch.firstHref(query);
      logger.info(`got href: ${href}`);

      if (href) {
        const result = await scrapeIt(href, { lyrics: { selector: ".lyrics" } });
        if (result.lyrics) {
          logger.info(`got lyrics`);
          lyrics = result.lyrics;
        } else {
          logger.info(`no lyrics`);
        }
      }

      this.setState({ lyrics: lyrics });
    } catch (e) {
      this.setState({ lyrics: "Failed to load lyrics" });
    }
  }

  render() {
    return (
      <ScrollView horizontal={false} style={[contentStyle.container, styles.container, this.props.style]}>
        <BigText style={styles.header}>Lyrics</BigText>
        <NormalText numberOfLines={null}>{this.state.lyrics}</NormalText>
      </ScrollView>
    );
  }
}

LyricsContent.propTypes = {
  song: React.PropTypes.object.isRequired,
};
