import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("Lyrics");

import scrapeIt from "scrape-it";
import { webSearch } from "app/utils/web_search/web_search";

class Lyrics {
  async find(song) {
    const logger = loggerCreator("find", moduleLogger);
    let lyrics = "";

    const query = `site:genius.com ${song.artist} ${song.title}`;
    logger.info(`querying: ${query}`);
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

    return lyrics;
  }
}

export const lyricsReal = new Lyrics();
