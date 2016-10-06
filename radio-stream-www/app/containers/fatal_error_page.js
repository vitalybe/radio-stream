import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"

@observer
export class FatalErrorPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="fatal-error-page">
                <h1>Unexpected error</h1>
                <div className="message">Error has happened</div>
            </div>
        )
    }
}