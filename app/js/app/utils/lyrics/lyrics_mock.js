import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("LyricsMock");

import sleep from "app/utils/sleep";

class Lyrics {
  async find(song) {
    loggerCreator("firstHref", moduleLogger);

    await sleep(500);
    return (
      "I am one with the world tonight\n" +
      "I am proud to be this far from you\n" +
      "\n" +
      "You say that you have no regrets\n" +
      "But I know that you do\n" +
      "You told me someone stole the eye\n" +
      "I know him too\n" +
      "\n" +
      "I've come to the conclusion - yes, I know\n" +
      "That between black and white\n" +
      "There is no room for two\n" +
      "The scale might be wide\n" +
      "But there's no need to be blind\n" +
      "Cause between black and white\n" +
      "There is no room for two\n" +
      "\n" +
      "I leave all of the grey behind\n" +
      "I see clear, I know that I'll find\n" +
      "\n" +
      "You claim that you are innocent\n" +
      "But tell me who ain't\n" +
      "You think that you're going to be saved\n" +
      "There's no such thing as a saint\n" +
      "\n" +
      "I've come to the conclusion - yes, I know\n" +
      "That between black and white\n" +
      "There is no room for two\n" +
      "The scale might be wide\n" +
      "But there is no need to be blind\n" +
      "Cause between black and white\n" +
      "There is no room for two\n" +
      "\n" +
      "Black and White\n" +
      "There's nothing in between\n" +
      "Black and White\n" +
      "Nothing's what it seems\n" +
      "\n" +
      "I've come to the conclusion - yes I know\n" +
      "That between black and white\n" +
      "There is no room for two\n" +
      "The scale might be wide\n" +
      "But there is no need to be blind\n" +
      "Cause between black and white\n" +
      "There is no room for two"
    );
  }
}

export const lyricsMock = new Lyrics();
