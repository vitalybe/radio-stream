require("../styles/dev_tools_project.less");
import React, { Component, PropTypes as T } from 'react';

import storeContainer from '../utils/store_container'
import * as wrappedSoundManager from '../utils/wrapped_sound_manager'

export default class DevToolsProject extends Component {

    constructor(props, context) {
        super(props, context);
    }

    onFastFoward() {
        let state = storeContainer.store.getState();
        let song = state.currentSongAsync.data;
        wrappedSoundManager.fastForward(song);
    }

    render() {
        return (
            <div className="dev-tools">
                <label>
                    <button onClick={this.onFastFoward.bind(this)}>Fast-forward</button>
                </label>
            </div>
        )
    }
}