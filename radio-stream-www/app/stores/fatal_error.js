 import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

export default class FatalError {

    static ERROR_NETWORK = "ERROR_NETWORK";
    static ERROR_LOGIC = "ERROR_LOGIC";

    constructor(errorType, errorMessage) {
        this.errorType = errorType;
        this.errorMessage = errorMessage;
    }
}
