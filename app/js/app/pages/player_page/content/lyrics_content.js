import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("LyricsContent");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, ScrollView } from "react-native";
import { observer } from "mobx-react";
import scrapeIt from "scrape-it";

import BigText from "app/shared_components/text/big_text";
import contentStyle from "./content_style";
import { webSearch } from "app/utils/web_search";
import SmallText from "app/shared_components/text/small_text";

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

    this.state = { lyrics: "Loading..." };
    let lyrics = "No lyrics were found";

    const query = `site:genius.com ${song.artist} ${song.title}`;
    logger.info(`querying: ${query}`);
    try {
      const href = await webSearch.firstHref(query);
      logger.info(`got href: ${href}`);

      if (href) {
        logger.info(`fetching ${href}...`);
        const response = await fetch(href);
        logger.info(`fetched. extracting text...`);
        const text = await response.text();
        const result = await scrapeIt.scrapeHTML(text, { lyrics: { selector: ".lyrics" } });
        if (result.lyrics) {
          logger.info(`got lyrics`);
          lyrics = result.lyrics;
        } else {
          logger.info(`no lyrics`);
        }
      }

      this.setState({ lyrics: lyrics });
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
