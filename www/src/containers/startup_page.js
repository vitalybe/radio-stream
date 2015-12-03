import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navigation } from '../components/navigation.js'

/**
 * Created by Vitaly on 01/12/2015.
 */
@connect(state => {
    return {
        playlistsAsync: state.playlistsAsync
    };
})
export class StartupPage extends Component {
    render() {
        return (
            <div>
                <h1>Music stream</h1>
                <Navigation playlistsAsync={this.props.playlistsAsync}/>
            </div>
        );
    }
}
