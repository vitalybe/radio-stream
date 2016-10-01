import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"
import classNames from 'classnames';
import moment from 'moment';

import assert from "../utils/assert"

@observer
export class SettingsModificationsPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentWillUnmount() {
        this.props.settingsModifications.load();
    }

    save() {
        let logger = loggerCreator(this.save.name, moduleLogger);
        logger.info(`start`);

        this.props.settingsModifications.save()
            .then(() => this.props.navigator.activatePlaylistCollection())
            .catch(err => logger.warn(`save failed: ${err}`))
    }

    render() {
        let settingsModifications = this.props.settingsModifications;

        return (
            <div className="settings-modifications-page">
                <label>Host</label>
                <input type="text" value={settingsModifications.host}
                       onChange={event => settingsModifications.host = event.target.value}/>

                <label>Password</label>
                <input type="password" value={settingsModifications.password}
                       onChange={event => settingsModifications.password = event.target.value}/>
                <div className="test-state">{settingsModifications.testState}</div>
                <button onClick={() => this.save()}>Save</button>
            </div>
        );
    }
}