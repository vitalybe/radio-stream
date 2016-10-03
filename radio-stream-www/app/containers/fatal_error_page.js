import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"

import FatalErrorStore from "../stores/fatal_error"

@observer
export class FatalErrorPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {

        var fatalErrorStore = this.props.fatalError;

        var header = "[Unknown error type]"
        if(fatalErrorStore.errorType == FatalErrorStore.ERROR_LOGIC) {
            header = "Unexpected error"
        } else if(fatalErrorStore.errorType == FatalErrorStore.ERROR_NETWORK) {
            header = "Network error"
        }

        var message = fatalErrorStore.errorMessage;

        return (
            <div className="fatal-error-page">
                <h1>{header}</h1>
                <div className="message">{message}</div>
            </div>
        )
    }
}