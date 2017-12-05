import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const logger = loggerCreator(__filename);

import { soundManager } from "soundmanager2";
import WrappedSound from "./wrapped_sound.js";
import settings from "app/utils/settings/settings";

function soundId(songId) {
  return "i" + songId.toString();
}

export function setup() {
  logger.debug(`Running soundManager setup`);
  soundManager.setup({
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    html5PollingInterval: 1000,
    debugMode: true,
  });
}

export function getSoundBySong(song) {
  let flogger = loggerCreator(getSoundBySong.name, logger);
  flogger.debug(song.toString());

  let sound = soundManager.getSoundById(soundId(song.id));
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
export function loadSound(song, options) {
  let flogger = loggerCreator(loadSound.name, logger);
  flogger.debug(song.toString());

  let loadingPromise = null;
  let id = soundId(song.id);
  if (loadingSongs[id]) {
    flogger.debug(`Sound is already being created, returning existing promise`);
    loadingPromise = loadingSongs[id];
  } else {
    flogger.debug(`Starting createSound for song...`);
    loadingPromise = new Promise(function(resolve, reject) {
      let soundUrl = !settings.values.isMock
        ? `http://${settings.values.host}/radio-stream/music/${song.path}`
        : song.path;
      let sound = soundManager.createSound(
        Object.assign(
          {
            id: id,
            url: soundUrl,
            stream: false,
            multiShotEvents: true,
          },
          options
        )
      );

      sound.load({
        stream: true,
        onload: function(success) {
          delete loadingSongs[id];

          flogger.debug(`Callback 'onload' - Success: ${success}`);
          let error = null;
          if (this.duration === 0) {
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
            soundManager.destroySound(id);
            reject(error);
          }
        },
      });
    });

    loadingSongs[id] = loadingPromise;
  }

  return loadingPromise;
}

export function stopAll() {
  soundManager.stopAll();
}
