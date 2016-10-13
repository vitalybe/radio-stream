import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"
import classNames from 'classnames';
import moment from 'moment';
import assert from "../utils/assert"

import settingsModifications from '../stores/settings_modifications'
import navigator from '../stores/navigator'

@observer
export class SettingsModificationsPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentWillUnmount() {
        settingsModifications.reset();
    }

    save() {
        let logger = loggerCreator(this.save.name, moduleLogger);
        logger.info(`start`);

        settingsModifications.save()
            .then(() => navigator.activatePlaylistCollection())
            .catch(err => logger.warn(`save failed: ${err}`))
    }

    render() {

        return (
            <div className="settings-modifications-page">
                <label>Host</label><input type="text" value={settingsModifications.host}
                       onChange={event => settingsModifications.host = event.target.value}/>

                <label>Password</label>
                <input type="password" value={settingsModifications.password}
                       onChange={event => settingsModifications.password = event.target.value}/>
                <label>Play/Pause shortcut</label>
                <input type="text" value={settingsModifications.playPauseKey}
                       onKeyDown={event => settingsModifications.modifyPlayPauseKey(event)}
                       onChange={() => {/* avoid react warning: https://github.com/facebook/react/issues/1118 */}} />
                <div className="test-state">{settingsModifications.testState}</div>

                <div className="buttons">
                    <button onClick={() => this.save()}>Save</button>
                </div>
            </div>
        );
    }
}