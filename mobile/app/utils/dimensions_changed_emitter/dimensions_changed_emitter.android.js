import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsChangedEmitter.android");

import Orientation from "react-native-orientation";

export default class DimensionsChangedEmitter {
  callback = null;

  constructor() {
    let logger = loggerCreator("constructor", moduleLogger);
    // HACk: For some reason not able to get events when Android orientation changes. Locking to portrait instead.
    Orientation.lockToPortrait();
  }

  subscribe(callback) {
    // only for web
  }

  unsubscribe(callback) {
    // only for web
  }
}
