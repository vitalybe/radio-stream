import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import lastFmSdk, { API_KEY } from '../utils/lastfm_sdk'

export function updateNowPlaying(song) {
    let logger = loggerCreator(updateNowPlaying.name, moduleLogger);
    logger.debug("Updating...");

    lastFmSdk.track.updateNowPlaying({artist: song.artist, track: song.name}, {
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

    var scrobbledSong = {artist: song.artist, track: song.name, timestamp: (new Date()).getTime() / 1000};
    lastFmSdk.track.scrobble(scrobbledSong, {
        success: function (data) {
            logger.info("Done");
        }, error: function (code, message) {
            logger.error(`Failed - ${message}`);
        }
    });
}