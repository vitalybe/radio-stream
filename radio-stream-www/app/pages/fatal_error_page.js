import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"

import navigator from '../stores/navigator'
import player from '../stores/player'

const logoImage = require("../images/logo.png");

@observer
export class FatalErrorPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        Promise.resolve()
            .then(() => { player.stop() })
            .catch(err => { console.warn("failed to pause song on error screen: " + err.stack) });
    }

    render() {
        return (
            <div className="fatal-error-page">
                <img className="logo" src={logoImage}/>

                <h1>Unexpected error</h1>
                <p className="message">{navigator.fatalErrorMessage}</p>
            </div>
        )
    }
}