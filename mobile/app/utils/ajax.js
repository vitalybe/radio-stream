import loggerCreator from "../utils/logger";
var moduleLogger = loggerCreator("ajax");

import _ from "lodash";
import NetworkError from "../utils/network_error";

export default class Ajax {
  // responseMiddleware: optional. function that accepts a response. Returns the response.
  constructor(rootAddress, customConfig) {
    this.rootAddress = rootAddress || "";
    this.customConfig = customConfig;
  }

  _ajaxCall(apiAddress, callConfig) {
    let logger = loggerCreator(this._ajaxCall.name, moduleLogger);

    let config = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    config = _.assign(config, this.customConfig);
    config = _.assign(config, callConfig);
    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    const url = this.rootAddress + apiAddress;

    logger.info(`[${config.method}] ${url}`);
    return Promise.resolve()
      .then(() => fetch(url, config))
      .then(function(response) {
        if (response.status < 200 || response.status >= 300) {
          logger.warn(`received network error status: ${response.status}`);
          throw new NetworkError(`Received status ${response.status} from the server`);
        }

        return response;
      })
      .catch(error => {
        logger.warn(`received network error: ${error}`);
        throw new NetworkError(`Received error ${error} from the server`);
      });
  }

  post(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({ method: "post" }, userConfig));
  }

  get(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({ method: "get" }, userConfig));
  }

  patch(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({ method: "patch" }, userConfig));
  }

  put(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({ method: "put" }, userConfig));
  }

  delete(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({ method: "delete" }, userConfig));
  }
}
