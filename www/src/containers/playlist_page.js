import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { Navigation } from '../components/navigation.js'
import * as musicActions from '../actions/music';


@connect(state => {
    return {
        playlistName: state.router.params.playlistName,
        playlistsAsync: state.playlistsAsync,

        currentSongAsync: state.currentSongAsync,
        isPlaying: state.isPlaying
    };
})
export class PlaylistPage extends Component {

    constructor(props, context) {
        super(props, context);
        this.props.dispatch(musicActions.playTogglePlaylistAction(this.props.playlistName));
    }

    render() {
        let currentSongAsync = this.props.currentSongAsync;
        let mainContent = null;
        if (currentSongAsync.inProgress) {
            mainContent = <div className="loader hexdots-loader"></div>
        } else if (currentSongAsync.error) {
            mainContent = <div className="error">Fa-Error</div>
        } else {
            let trackName = currentSongAsync.data.name;
            let trackArtist = currentSongAsync.data.artist;

            let starCount = currentSongAsync.data.rating / 20;
            let ratingStars = _.range(5).map(starIndex => {
                let starClass = starCount > starIndex ? "fa-star" : "fa-star-o";
                return <i className={classNames(["fa", starClass])} />;
            });

            let playPauseClass = this.props.isPlaying ? "fa-pause" : "fa-play";

            mainContent = (
                <div className="player">
                    <h1 className="track-name">{trackName}</h1>
                    <h2 className="track-artist">{trackArtist}</h2>
                    <div className="stars">{ratingStars}</div>
                    <div className="control-buttons">
                        <i className={classNames(["play-pause", "fa", playPauseClass])} />
                        <i className="next fa fa-fast-forward" />
                    </div>
                </div>
            );
        }

        return (
            <div className="playlist-page">
                <div className="sidebar">
                    <Navigation playlistsAsync={this.props.playlistsAsync} activePlaylist={this.props.playlistName}/>
                </div>
                <div className="main">
                    {mainContent}
                </div>
            </div>
        );
    }
}