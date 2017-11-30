import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("webSearch");

import constants from "app/utils/constants";

import { webSearchReal } from "./web_search_real";
import { webSearchMock } from "./web_search_mock";

let instance = webSearchReal;
if (constants.MOCK_MODE) {
  instance = webSearchMock;
}

export const webSearch = instance;
