import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("lyrics");

import constants from "app/utils/constants";

import { lyricsReal } from "./lyrics_real";
import { lyricsMock } from "./lyrics_mock";

let instance = lyricsReal;
if (constants.MOCK_MODE) {
  instance = lyricsMock;
}

export const lyrics = instance;
