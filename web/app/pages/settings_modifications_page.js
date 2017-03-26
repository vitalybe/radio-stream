import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
const moduleLogger = loggerCreator(__filename);

//noinspection JSUnresolvedVariable
import React, {Component} from 'react';
import {observer} from "mobx-react"
import classNames from 'classnames';
//noinspection JSUnresolvedVariable
import keycode from "keycode";

import {getSettings, Settings} from '../stores/settings'
import * as backendMetadataApi from '../utils/backend_metadata_api'
import navigator from '../stores/navigator'

@observer
export class SettingsModificationsPage extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      values: _.clone(getSettings().values),
      testState: "",
      isTestError: false
    }

    this._modifierKeys = [
      keycode("left command"), keycode("right command"),
      keycode("shift"), keycode("ctrl"), keycode("alt")
    ];
  }

  componentWillUnmount() {
  }

  keyboardEventToString(keyboardEvent) {
    let logger = loggerCreator(this.keyboardEventToString.name, moduleLogger);
    logger.info(`start`);

    let name = keycode(keyboardEvent);
    let code = keyboardEvent.keyCode;
    let ctrl = keyboardEvent.ctrlKey;
    let shift = keyboardEvent.shiftKey;
    let alt = keyboardEvent.altKey;
    let meta = keyboardEvent.metaKey;

    logger.info(`[${name}] code: ${code}. ctrl: ${ctrl}. shift: ${shift}. alt: ${alt}. meta: ${meta}`)

    let keyParts = [];
    if (this._modifierKeys.indexOf(code) == -1 && name) {
      if (ctrl) keyParts.push("Ctrl")
      if (shift) keyParts.push("Shift")
      if (alt) keyParts.push("Alt")
      if (meta) keyParts.push("Cmd")

      if (name.match(/[\w]/)) {
        name = _.startCase(name).split(" ").join("")
      }
      keyParts.push(name);

      let key = keyParts.join("+")

      logger.info(`accelerator: ${key}`);
      return key;
    } else {
      logger.info(`modifier key`);
      return "";
    }
  }

  async onSave() {
    let logger = loggerCreator(this.onSave.name, moduleLogger);
    logger.info(`start`);

    let customSettings = new Settings();
    customSettings.update(this.state.values);

    this.setState({testState: `Connecting to ${customSettings.address}...`, isTestError: false})
    try {
      await backendMetadataApi.testConnection(customSettings);
      this.setState({testState: "Connection is successful"});

      getSettings().update(this.state.values);
      await getSettings().save();

      navigator.activatePlaylistCollection()
    } catch (err) {
      this.setState({testState: "Connection failed: " + err.toString(), isTestError: true});
    }
  }


  render() {

    return (
      <div className="settings-modifications-page">
        <label>Host</label>
        <input type="text" value={this.state.values.host}
               onChange={event => this.setState({values: Object.assign({}, this.state.values, {host: event.target.value})})}/>
        <label>Password</label>
        <input type="password" value={this.state.values.password}
               onChange={event => this.setState({values: Object.assign({}, this.state.values, {password: event.target.value})})}/>
        <label>Play/Pause shortcut</label>
        <input type="text" value={this.state.values.playPauseKey}
               onKeyDown={event => this.setState({values: Object.assign({}, this.state.values, {playPauseKey: this.keyboardEventToString(event)})})}
               onChange={() => {/* avoid react warning: https://github.com/facebook/react/issues/1118 */
               }}/>
        <div className={classNames("test-state", {"error": this.state.isTestError})}>
          {this.state.testState}
        </div>

        <div className="buttons">
          <button onClick={() => this.onSave()}>Save</button>
        </div>
      </div>
    );
  }
}