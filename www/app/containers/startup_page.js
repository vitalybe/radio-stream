import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Navigation } from '../components/navigation.js'
import * as musicActions from '../actions/music_actions';

/**
 * Created by Vitaly on 01/12/2015.
 */
@connect(state => {
    return {
        playlistsAsync: state.playlistsAsync
    };
})
export class StartupPage extends Component {
    constructor(props, context) {
        super(props, context);
        if (!this.props.playlistsAsync.data) {
            this.props.dispatch(musicActions.loadAvailablePlaylists());
        }
    }

    render() {
        return (
            <div>
                <h1>Music stream</h1>
                <Navigation playlistsAsync={this.props.playlistsAsync}/>
            </div>
        );
    }
}
