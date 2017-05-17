import loggerCreator from '../../../utils/logger'
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator(__filename);

// wraps SoundManager2 sound object
export default class WrappedSound {

  constructor(sound) {
    let logger = loggerCreator("constructor", moduleLogger);
        this._sound = sound;
  }

  play(options) {
    this._sound.play(options);
  }

  pause() {
    this._sound.pause();
  }

  stop() {
    this._sound.stop();
  }

  setPosition(duration) {
    return this._sound.setPosition(duration);
  }

  get loaded() {
    return this._sound.loaded;
  }

  get playState() {
    return this._sound.playState;
  }

  get paused() {
    return this._sound.paused;
  }

  get duration() {
    return this._sound.duration;
  }

  get position() {
    return this._sound.position;
  }

}