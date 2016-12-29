import { soundManager } from 'soundmanager2';
import WrappedSound from './wrapped_sound.js'
import { getSettings } from '../stores/settings'

import loggerCreator from './logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

export function setup() {
    logger.debug(`Running soundManager setup`);
    soundManager.setup({
        url: require("file!../../lib/swf/soundmanager2.swf"),
        flashVersion: 9, // optional: shiny features (default = 8)
        // optional: ignore Flash where possible, use 100% HTML5 mode
        preferFlash: false,
        html5PollingInterval: 1000,
        debugMode: true
    });
}

export function getSoundBySong(song) {
    let flogger = loggerCreator(getSoundBySong.name, logger);
    flogger.debug(song.toString());

    let sound = soundManager.getSoundById(song.id);
    if (sound) {
        flogger.debug(`Sound found`);
        sound = new WrappedSound(sound);
    } else {
        flogger.debug(`Sound not found`);
    }

    return sound;
}

// List of loading songs promises
let loadingSongs = {};

// returns promise.
// resolves to WrappedSound
export function loadSound(song) {
    let flogger = loggerCreator(loadSound.name, logger);
    flogger.debug(song.toString());

    let loadingPromise = null;
    if (loadingSongs[song.id]) {
        flogger.debug(`Sound is already being created, returning existing promise`);
        loadingPromise = loadingSongs[song.id];
    } else {
        flogger.debug(`Starting createSound for song...`);
        loadingPromise = new Promise(function (resolve, reject) {
            var soundUrl = `${getSettings().address}/music/${song.path}`;
            let sound = soundManager.createSound({id: song.id, url: soundUrl, stream: false});
            sound.load({
                stream: false,
                onload: function (success) {
                    delete loadingSongs[song.id];

                    flogger.debug(`Callback 'onload' - Success: ${success}`);
                    let error = null;
                    if (this.duration == 0) {
                        let message = `Duration after load was 0`;
                        flogger.error(message);
                        error = new Error(message);
                    }

                    if (!this.loaded) {
                        let message = `Loaded is false`;
                        flogger.error(message);
                        error = new Error(message);
                    }

                    if (!error) {
                        flogger.debug(`Sound loaded`);
                        resolve(new WrappedSound(this));
                    } else {
                        flogger.debug(`Sound destroyed`);
                        soundManager.destroySound(song.id);
                        reject(error);
                    }
                }
            });
        });

        loadingSongs[song.id] = loadingPromise;
    }

    return loadingPromise;
}

export function stopAll() {
    soundManager.stopAll();
}

export function fastForward(song) {
    let fLogger = loggerCreator(fastForward.name, logger);
    fLogger.debug(song.toString());

    let sound = getSoundBySong(song);
    sound.setPosition(sound.duration - 10000);
}