import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("DimensionsChangedEmitter");

import _ from "lodash";

export default class DimensionsChangedEmitter {
  callback = null;

  _onResize = _.throttle(
    () => {
      loggerCreator("_OnResize", moduleLogger);

      if (this.callback) {
        this.callback();
      }
    },
    500,
    { leading: true, trailing: true }
  );

  subscribe(callback) {
    this.callback = callback;
    window.addEventListener("resize", this._onResize);
  }

  unsubscribe() {
    window.removeEventListener("resize", this._onResize);
    this.callback = null;
  }
}
