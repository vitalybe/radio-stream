import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Counter } from './components';
import { fetchNextSongDetails } from './actions';

export class App extends Component {
    render() {
        return (
            <div>
                <h1>Music stream</h1>
                {this.props.children}
            </div>
        );
    }
}


// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
    return {
        nextSongAsync: state.nextSongAsync,
        playlistName: state.router.params.playlistName
    };
}

@connect(mapStateToProps)
export class PlaylistPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    _fetchNextSong() {
        this.props.dispatch(fetchNextSongDetails(this.props.playlistName));
    }

    render() {

        let nextSongAsync = this.props.nextSongAsync;
        let nextSongText = null;

        if (!nextSongAsync.inProgress) {
            if(nextSongAsync.song) {
                nextSongText = JSON.stringify(nextSongAsync.song)
            } else {
                nextSongText = JSON.stringify(nextSongAsync.error)
            }
        } else {
            nextSongText = "Loading...";
        }


        return (
            <div>
                <div>Current playlist: {this.props.playlistName}</div>
                <div>Next song: {nextSongText}</div>
                <button onClick={() => this._fetchNextSong()}>Get next song</button>
            </div>
        );
    }
}