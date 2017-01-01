import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import lastFmSdk, {API_KEY} from '../utils/lastfm_sdk'

export function getArtistImage(artist) {
  let logger = loggerCreator(getArtistImage.name, moduleLogger);
  logger.info("Start");

  var params = {artist, autocorrect: 1};
  return new Promise(function (resolve, reject) {
    lastFmSdk.artist.getInfo(params, {
      success: function (data) {
        logger.info("Done");
        resolve(data.artist.image[3]["#text"]);
      }, error: function (code, message) {
        logger.error(`Failed - ${message}`);
        reject(message);
      }
    });
  });
}
