import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import fetch from 'isomorphic-fetch'
import NetworkError from '../utils/network_error'


class Ajax {

    _ajax(apiAddress, userConfig) {
        let logger = loggerCreator(this._ajax.name, moduleLogger);

        var config = {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        config = _.assign(config, userConfig);
        if (config.body) {
            config.body = JSON.stringify(config.body);
        }

        var url = this.rootAddress + apiAddress;

        logger.info(`start: ${config.method} ${url}`);
        return Promise.resolve()
            .then(() => fetch(url, config))
            .then(this.responseMiddleware)
            .then(function (response) {
                if (response.status < 200 || response.status >= 300) {
                    throw new NetworkError(`Received status ${response.status} from the server`);
                }

                return response;
            });
    }

    post(apiAddress, userConfig) {
        return this._ajax(apiAddress, _.assign({method: "post"}, userConfig))
    }


    get(apiAddress, userConfig) {
        return this._ajax(apiAddress, _.assign({method: "get"}, userConfig))
    }


    patch(apiAddress, userConfig) {
        return this._ajax(apiAddress, _.assign({method: "patch"}, userConfig))
    }


    put(apiAddress, userConfig) {
        return this._ajax(apiAddress, _.assign({method: "put"}, userConfig))
    }

    // responseMiddleware: optional. function that accepts a response. Returns the response.
    constructor(rootAddress, responseMiddleware) {
        this.rootAddress = rootAddress || "";

        this.responseMiddleware = (response) => response;
        if(responseMiddleware) {
            this.responseMiddleware = responseMiddleware;
        }
    }
}

// see: Ajax constructor
export default function getAjax(...args) {
    return new Ajax(...args);
}