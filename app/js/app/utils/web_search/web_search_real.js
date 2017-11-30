import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("WebSearch");

import scrapeIt from "scrape-it";

class WebSearch {
  async firstHref(query) {
    const logger = loggerCreator("firstHref", moduleLogger);

    const encodedQuery = encodeURI(query);
    let url = "https://duckduckgo.com/html/?q=" + encodedQuery + "&ia=web";
    logger.info(`fetching ${url}...`);
    const response = await fetch(url);
    logger.info(`fetched. extracting text...`);
    const text = await response.text();
    // NOTE: scrapeIt could in theory perform the HTTP request, but it just hangs (on android), so I am using fetch
    // directly
    const result = await scrapeIt.scrapeHTML(text, {
      href: { selector: ".result__url", eq: 0 },
    });
    return "https://" + result.href;
  }
}

export const webSearchReal = new WebSearch();
