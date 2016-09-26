import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"
import classNames from 'classnames';
import moment from 'moment';

import assert from "../utils/assert"

@observer
export class SettingsPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="settings-page">
            </div>
        );
    }
}