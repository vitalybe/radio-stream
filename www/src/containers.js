import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Counter } from './components';
import * as actions from './actions';

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
        playlistName: state.router.params.playlistName,
        currentSong: state.currentSong
    };
}

@connect(mapStateToProps)
export class PlaylistPage extends Component {

    constructor(props, context) {
        super(props, context);
        this.props.dispatch(actions.fetchNextSongDetails(this.props.playlistName));
    }

    _play() {
        let song = this.props.nextSongAsync.song;
        if (!song.id) {
            throw new Error("Song ID is invalid: " + song.id);
        }

        this.props.dispatch(actions.playToggleSong(song));
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

        let currentSong = this.props.currentSong;
        let playButtonText = "Play";
        if (currentSong.loading) {
            playButtonText = "Loading...";
        } else if (currentSong.playing) {
            playButtonText = "Pause";
        }

        return (
            <div>
                <div>Current playlist: {this.props.playlistName}</div>
                <div>Next song: {nextSongText}</div>
                <button onClick={() => this._play()} disabled={!nextSongAsync.song}>{playButtonText}</button>
                <button onClick={() => this.props.dispatch(actions.playPlaylist(this.props.playlistName))}
                        disabled={!nextSongAsync.song}>Play playlist
                </button>
                <button onClick={() => this.props.dispatch(actions.fastForward(currentSong.id))}
                        disabled={!currentSong.playing}>
                    Fast forward
                </button>
            </div>
        );
    }
}

export class LoginPage extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {success: "" };
    }

    login() {
        let inputPassword = this.refs.password.getDOMNode().value;
        this.setState({success: "Loading" });
        actions.login(inputPassword).then((result) => {
            this.setState({success: result.success })
        });
    }

    render() {
        return (
            <div>
                <input type="password" placeholder="Password" ref="password"></input>
                <button onClick={this.login.bind(this)}>Submit</button>
                <div>Success: {this.state.success.toString()}</div>
            </div>
        );
    }
}