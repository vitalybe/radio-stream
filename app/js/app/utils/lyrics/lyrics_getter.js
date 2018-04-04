import loggerCreator from "app/utils/logger";
const moduleLogger = loggerCreator("lyrics");

import settings from "app/utils/settings/settings";

import { lyricsReal } from "./lyrics_real";
import { lyricsMock } from "./lyrics_mock";
class LyricsGetter {
  get() {
    let instance = lyricsReal;
    if (settings.values.isMock) {
      instance = lyricsMock;
    }

    return instance;
  }
}

export const lyricsGetter = new LyricsGetter();
