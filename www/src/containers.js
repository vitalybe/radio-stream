import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { soundManager } from 'soundmanager2';

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

        let soundManagerSwf = require("file!../lib/swf/soundmanager2.swf");
        soundManager.setup({
            url: soundManagerSwf,
            flashVersion: 9, // optional: shiny features (default = 8)
            // optional: ignore Flash where possible, use 100% HTML5 mode
            // preferFlash: false,
            onready: function () {
            }
        });

        this.props.dispatch(fetchNextSongDetails(this.props.playlistName));
        this.sound = null;
    }

    _createSound(songId) {
        return soundManager.createSound({
            id: songId, // optional: provide your own unique id
            url: 'http://localhost:5000/song/' + songId + "/stream",
            autoLoad: true,
            onload: function() {
                // DEBUG - Auto rewind to -10 seconds
                console.log('sound loaded! duration: ' + this.duration, this);
                this.setPosition(this.duration - 10000);
            }
        });
    }

    _play() {
        if (!this.sound) {
            throw new Error("No sound available")
        }

        this.sound.togglePause();
        this.sound.setPosition(this.sound.duration - 10000);
    }

    render() {

        let nextSongAsync = this.props.nextSongAsync;
        let nextSongText = null;

        if (nextSongAsync.song) {
            nextSongText = JSON.stringify(nextSongAsync.song)
        } else if (nextSongAsync.error) {
            nextSongText = JSON.stringify(nextSongAsync.error)
        } else {
            nextSongText = "Loading...";
        }

        if (nextSongAsync.song && (!this.sound || this.sound.id !== nextSongAsync.song.id)) {
            this.sound = this._createSound(nextSongAsync.song.id)
        }

        return (
            <div>
                <div>Current playlist: {this.props.playlistName}</div>
                <div>Next song: {nextSongText}</div>
                <button onClick={() => this._play()} disabled={!nextSongAsync.song}>Play</button>
            </div>
        );
    }
}