import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("webSearch");

import settings from "app/utils/settings/settings";

import { webSearchReal } from "./web_search_real";
import { webSearchMock } from "./web_search_mock";

class WebSearchGetter {
  get() {
    let instance = webSearchReal;
    if (settings.values.isMock) {
      instance = webSearchMock;
    }

    return instance;
  }
}

export const webSearchGetter = new WebSearchGetter();
