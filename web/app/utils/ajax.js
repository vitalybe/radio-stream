import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import fetch from 'isomorphic-fetch'
import NetworkError from '../utils/network_error'


export default class Ajax {

  // responseMiddleware: optional. function that accepts a response. Returns the response.
  constructor(rootAddress, customConfig) {
    this.rootAddress = rootAddress || "";
    this.customConfig = customConfig;
  }

  _ajaxCall(apiAddress, callConfig) {
    let logger = loggerCreator(this._ajaxCall.name, moduleLogger);

    var config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    config = _.assign(config, this.customConfig);
    config = _.assign(config, callConfig);
    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    var url = this.rootAddress + apiAddress;

    logger.info(`start: ${config.method} ${url}`);
    return Promise.resolve()
      .then(() => fetch(url, config))
      .then(function (response) {
        if (response.status < 200 || response.status >= 300) {
          throw new NetworkError(`Received status ${response.status} from the server`);
        }

        return response;
      });
  }

  post(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({method: "post"}, userConfig))
  }


  get(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({method: "get"}, userConfig))
  }


  patch(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({method: "patch"}, userConfig))
  }


  put(apiAddress, userConfig) {
    return this._ajaxCall(apiAddress, _.assign({method: "put"}, userConfig))
  }
}