import { soundManager } from 'soundmanager2';
import rootLogger from './logger'
const logger = rootLogger.prefix("wrappedSoundManager");

const MUSIC_ADDRESS = window.location.protocol + "//" + window.location.hostname + ":16768";

logger.info(`running soundManager setup`);
soundManager.setup({
    url: require("file!../lib/swf/soundmanager2.swf"),
    flashVersion: 9, // optional: shiny features (default = 8)
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    html5PollingInterval: 50
});

export function getSoundBySong(song) {
    let songId = song.id;

    let sound = soundManager.getSoundById(songId);
    if(sound) {
        sound = new WrappedSound(song, sound);
    }

    return sound;
}

// List of loading songs promises
let loadingSongs = {};

// returns promise.
// resolves to WrappedSound
export function loadSound(song) {
    let songId = song.id;
    logger.info(`request to load song: ${songId}`)

    let loadingPromise = null;
    if(loadingSongs[songId]) {
        logger.info(`sound is already being created, returning existing promise: ${songId}`)
        loadingPromise = loadingSongs[songId];
    } else {
        logger.info(`starting createSound for song: ${songId}`);
        loadingPromise = new Promise(function (resolve, reject) {
            soundManager.createSound({
                id: songId, // optional: provide your own unique id
                url: MUSIC_ADDRESS + "/" + song.location,
                autoLoad: true,
                // Every song that was loaded, should have the following events
                // NOTE: This is a bit of a leaky abstraciton. It is tricky to decouple onfinish from this function since
                // events can be subscribed to only on creation or during play.
                onload: function (success) {
                    delete loadingSongs[songId];

                    logger.info(`SoundManager loadSound finished. Success: ${success}`);
                    if (this.duration == 0) {
                        reject(new Error(`Song ${songId} duration after load was 0`))
                    }

                    if (!this.loaded) {
                        reject(new Error(`Song ${songId} loaded is false`))
                    }

                    logger.info(`SUCCESS song ${songId}: loaded`);
                    resolve(new WrappedSound(song, this));

                }
            })
        });

        loadingSongs[songId] = loadingPromise;
    }

    return loadingPromise;
}

// wraps SoundManager2 sound object
export class WrappedSound {

    constructor(song, sound) {
        this.song = song;
        this.sound = sound;
    }

    // options:
    // onPosition - {position: X, callback: Y}. Called when playing reaches this position. Callback is discarded when the song is paused/stopped.
    // Other options are avialable per docs of soundManager sound.play function.
    play(options = {}) {
        if(options.onPosition) {

            let {position, callback} = options.onPosition;

            logger.info(`adding a callback on position: ${position}`);
            // clears all callbacks on this position, prevents duplicates callbacks on play/pause
            this.sound.clearOnPosition(position);
            this.sound.onPosition(position, callback);

            delete options.onPosition;
        }

        this.sound.play(options);
    }

    pause() { this.sound.pause(); }
    get loaded() { return this.sound.loaded; }
    get playState() { return this.sound.playState; }
    get paused() { return this.sound.paused; }
    get duration() { return this.sound.duration; }

}