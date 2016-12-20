import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator("backend_metadata_api");

const btoa = require('base-64').encode;
import Ajax from '../utils/ajax'
import settings from '../utils/settings'

class BackendMetadataApi {

  // NOTE: Since the host might change, we create a new Ajax object every time
  _getAjax(customSettings) {

    let usedSettings = settings;
    if (customSettings) {
      usedSettings = customSettings;
    }

    var beetsServer = `http://${usedSettings.host}/api`;
    var credentials = btoa(unescape(encodeURIComponent(settings.user + ':' + settings.password)));
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

  testConnection(user, password, host) {
    var testSettings = {user: settings.user, host: host, password: password};
    return this._getAjax(testSettings).get(`/playlists`);
  }
}

export default new BackendMetadataApi();
