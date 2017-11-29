import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("WebSearchMock");

import sleep from "app/utils/sleep";

class WebSearch {
  async firstHref(query) {
    loggerCreator("firstHref", moduleLogger);

    await sleep(500);
    return "https://www.google.com";
  }
}

export const webSearchMock = new WebSearch();
