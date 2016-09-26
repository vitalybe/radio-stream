require("../styles/dev_tools_project.less");
import React, { Component, PropTypes as T } from 'react';

import * as wrappedSoundManager from '../utils/wrapped_sound_manager'
import lastFm, { API_KEY } from '../utils/lastfm_sdk'

export default class DevToolsProject extends Component {

    constructor(props, context) {
        super(props, context);
    }

    onFastFoward() {
        let state = storeContainer.store.getState();
        let song = state.currentSongAsync.data;
        wrappedSoundManager.fastForward(song);
    }

    onLastFmAuthUrl() {
        lastFm.auth.getToken({
            success: function (data) {
                let token = data.token;
                console.log(`Approve app here: http://www.last.fm/api/auth/?api_key=${API_KEY}&token=` + token)

            }, error: function (code, message) {
                console.log(message);
            }
        });
    }

    onLastFmGetSessionToken() {
        let token = prompt("Enter a token that was approved by the user");
        if (token) {
            lastFm.auth.getSession({token}, {
                success: function (data) {
                    console.log(data.session)
                }, error: function (code, message) {
                    console.log(message);
                }
            });
        }
    }


    render() {
        return (
            <div className="dev-tools">
                <label>
                    <button onClick={this.onFastFoward.bind(this)}>Fast-forward</button>
                    <button onClick={this.onLastFmAuthUrl.bind(this)}>Last.fm auth URL</button>
                    <button onClick={this.onLastFmGetSessionToken.bind(this)}>Last.fm get session token</button>
                </label>
            </div>
        )
    }
}