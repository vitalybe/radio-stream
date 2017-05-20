import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator(__filename);

import promiseRetryLib from "promise-retry";

class Retries {
  promiseRetry(promiseReturningFunc) {
    let logger = loggerCreator(this.promiseRetry.name, moduleLogger);
    let lastError = null;

    return promiseRetryLib((retry, number) => {
      logger.info(`try number: ${number}`);

      return promiseReturningFunc(lastError).catch(err => {
        logger.warn(`promise failed... retrying: ${err}`);
        lastError = err;

        retry(err);
      })
    }, {retries: 1000})
  }
}

export default new Retries();