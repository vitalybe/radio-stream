import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("backend_metadata_api");

const btoa = require('base-64').encode;
import Ajax from '../utils/ajax'
import { globalSettings } from '../utils/settings'

class BackendMetadataApi {

  // NOTE: Since the host might change, we create a new Ajax object every time
  _getAjax(customSettings) {

    let usedSettings = globalSettings;
    if (customSettings) {
      usedSettings = customSettings;
    }

    const beetsServer = `http://${usedSettings.host}/api`;
    const credentials = btoa(unescape(encodeURIComponent(usedSettings.user + ':' + usedSettings.password)));
    return new Ajax(beetsServer, {
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

  testConnection(testSettings) {
    let logger = loggerCreator("testConnection", moduleLogger);
    logger.info(`start`);

    return this._getAjax(testSettings).get(`/playlists`);
  }
}

export default new BackendMetadataApi();
