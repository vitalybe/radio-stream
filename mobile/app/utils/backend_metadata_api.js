import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("backend_metadata_api");

const btoa = require('base-64').encode;
import Ajax from '../utils/ajax'
import {globalSettings} from '../utils/settings'

class BackendMetadataApi {

  // NOTE: Since the host might change, we create a new Ajax object every time
  _getAjax(customHost, customPassword) {
    let logger = loggerCreator("_getAjax", moduleLogger);

    let host = globalSettings.host;
    let password = globalSettings.password;

    if (customHost && customPassword) {
      logger.info(`using custom host/password`);
      host = customHost;
      password = customPassword;
    } else {
      logger.info(`using global host/password`);
    }

    if (!host || !password) {
      throw new Error("host or password are empty")
    }

    const address = `http://${host}/radio-stream/api`;
    const credentials = btoa(unescape(encodeURIComponent(globalSettings.user + ':' + password)));
    return new Ajax(address, {
      'headers': {
        'Authorization': "Basic " + credentials,
        'Content-Type': "application/json"
      }
    });
  }

  playlists() {

    return this._getAjax().get(`/playlists`)
      .then(response => response.json().then(json => json))
      .then((json) => {
        return json.playlists;
      });
  }

  playlistSongs(playlistName) {

    return this._getAjax().get(`/playlists/${playlistName}`)
      .then(response => response.json().then(json => json))
      .then((json) => {
        return json.results;
      });
  }

  updateRating(songId, newRating) {
    return this._getAjax().put(`/item/${songId}/rating`, {body: {newRating}});
  }

  updateLastPlayed(songId) {
    return this._getAjax().post(`/item/${songId}/last-played`);
  }

  markAsDeleted(songId) {
    return this._getAjax().delete(`/item/${songId}`);
  }

  testConnection(host, password) {
    let logger = loggerCreator("testConnection", moduleLogger);
    logger.info(`host: ${host}`);

    return this._getAjax(host, password).get(`/playlists`);
  }
}

export default new BackendMetadataApi();
