import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator("preventConcurrentAsync");

export default function preventConcurrentAsync(callback) {
  let executingFunctionPromise = null;

  return async () => {
    const logger = loggerCreator("preventConcurrentAsync", moduleLogger);

    if (!executingFunctionPromise) {
      logger.info(`callback function isn't currently running, running the function..`);
      executingFunctionPromise = callback(...arguments);
    } else {
      logger.info(`callback function is already running`);
    }

    executingFunctionPromise.then(() => {
      logger.info(`callback function finished`);
      executingFunctionPromise = null;
    });

    return executingFunctionPromise;
  };
}
