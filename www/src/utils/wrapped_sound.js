import loggerCreator from './logger'
//noinspection JSUnresolvedVariable
var logger = loggerCreator(__filename);

// wraps SoundManager2 sound object
export default class WrappedSound {

    constructor(sound) {

        this._sound = sound;
    }

    play(options) {
        this._sound.play(options);
    }

    pause() { this._sound.pause(); }
    stop() { this._sound.stop(); }

    get loaded() { return this._sound.loaded; }
    get playState() { return this._sound.playState; }
    get paused() { return this._sound.paused; }
    get duration() { return this._sound.duration; }

}