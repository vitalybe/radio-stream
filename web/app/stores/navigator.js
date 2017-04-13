import loggerCreator from '../utils/logger'
import assert from '../utils/assert'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import {observable, action} from "mobx";

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
class Navigator {

  @observable fatalErrorMessage = null;

  constructor() {
  }


  activateFatalError(errorMessage) {
    let logger = loggerCreator(this.activateFatalError.name, moduleLogger);
    logger.info(`start`);

    this.fatalErrorMessage = errorMessage;
  }
}

export default new Navigator();