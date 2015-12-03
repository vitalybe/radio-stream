import rootLogger from './logger'
const logger = rootLogger.prefix("WrappedSound");

// wraps SoundManager2 sound object
export default class WrappedSound {

    constructor(song, sound) {
        this.song = song;
        this.sound = sound;
    }

    // options:
    // on75PercentPlayed - callback. Called when playing reaches specified percent.
    //                     Callback is discarded when the song is paused/stopped.
    // Other options are available per docs of soundManager sound.play function.
    play(options = {}) {
        if(options.on75PercentPlayed) {

            let callback = options.on75PercentPlayed;
            let targetPosition = this.sound.duration * 0.75;

            logger.info(`adding a callback on position: ${targetPosition}`);
            // clears all callbacks on this position, prevents duplicates callbacks on play/pause
            this.sound.clearOnPosition(targetPosition);
            this.sound.onPosition(targetPosition, callback);

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