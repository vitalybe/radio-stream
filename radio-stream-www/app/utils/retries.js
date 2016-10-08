import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import { observable, action } from "mobx";

import promiseRetryLib from "promise-retry";

class Retries {
    promiseRetry(promiseReturningFunc) {
        let logger = loggerCreator(this.promiseRetry.name, moduleLogger);

        return promiseRetryLib((retry, number) => {
            logger.info(`start. try number: ${number}`);

            return promiseReturningFunc().catch(err => {
                logger.warn(`promise failed... retrying: ${err}`);
                retry();
            })
        }, {retries: 1000})
    }
}

export default new Retries();