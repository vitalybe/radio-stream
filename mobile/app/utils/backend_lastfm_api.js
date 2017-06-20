import loggerCreator from "../utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("backend_lastfm_api");

export const API_KEY = "9e46560f972eb8300c78c0fc837d1c13";

export async function getArtistImage(artist) {
  let logger = loggerCreator(getArtistImage.name, moduleLogger);

  try {
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&autocorrect=1&api_key=${API_KEY}&format=json`
    );
    const responseJson = await response.json();
    logger.info(`got response: ${responseJson}`);
    return responseJson.artist.image[3]["#text"];
  } catch (e) {
    logger.warn(`failed to fetch song art`);
  }
}
