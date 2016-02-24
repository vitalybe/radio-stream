import fetch from 'isomorphic-fetch'

class Ajax {

    _ajax(apiAddress, userConfig) {
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

        return fetch(this.rootAddress + apiAddress, config)
            .then(this.responseMiddleware)
            .then(function (response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }

                return response;
            })
            .catch(function(err) {
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