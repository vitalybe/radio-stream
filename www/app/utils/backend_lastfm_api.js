import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import lastFmSdk, { API_KEY } from '../utils/lastfm_sdk'

export function updateNowPlaying(song) {
    let logger = loggerCreator(updateNowPlaying.name, moduleLogger);
    logger.debug("Updating...");

    lastFmSdk.track.updateNowPlaying({artist: song.artist, track: song.title}, {
        success: function (data) {
            logger.info("Done");
        }, error: function (code, message) {
            logger.error(`Failed - ${message}`);
        }
    });
}

export function scrobble(song) {
    let logger = loggerCreator(scrobble.name, moduleLogger);
    logger.debug("Scrobbling...");

    var scrobbledSong = {artist: song.artist, track: song.title, timestamp: (new Date()).getTime() / 1000};
    lastFmSdk.track.scrobble(scrobbledSong, {
        success: function (data) {
            logger.info("Done");
        }, error: function (code, message) {
            logger.error(`Failed - ${message}`);
        }
    });
}

export function getArtist(artist) {
    let logger = loggerCreator(getArtist.name, moduleLogger);
    logger.debug("Start");

    var params = {artist, autocorrect: 1};
    return new Promise(function (resolve, reject) {
        lastFmSdk.artist.getInfo(params, {
            success: function (data) {
                logger.info("Done");
                resolve(data.artist);
            }, error: function (code, message) {
                logger.error(`Failed - ${message}`);
                reject(message);
            }
        });
    });
}
