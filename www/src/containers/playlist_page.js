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
        let playPauseClass = this.props.isPlaying ? "fa-pause" : "fa-play";
        let currentSongAsync = this.props.currentSongAsync;
        let ratingStars = null;
        if (currentSongAsync.data) {

            let starCount = currentSongAsync.data.rating / 20;
            ratingStars = _.range(5).map(starIndex => {
                let starClass = starCount > starIndex ? "fa-star" : "fa-star-o";
                return <i className={classNames(["fa", starClass])}/>;
            });

        }

        return (
            <div className="playlist-page">
                <div className="sidebar">
                    <Navigation playlistsAsync={this.props.playlistsAsync} activePlaylist={this.props.playlistName}/>
                </div>
                <div className="main">
                    <If condition={currentSongAsync.inProgress}>

                        /********* Loader **********/
                        <div className="loader hexdots-loader"></div>

                        <Else/>

                        <If condition={currentSongAsync.error}>

                            /********* Error **********/
                            <div className="critical-error">Fa-Error</div>

                            <Else/>

                            /********* Player **********/
                            <div className="player">
                                <h1 className="track-name">{currentSongAsync.data.name}</h1>
                                <h2 className="track-artist">{currentSongAsync.data.artist}</h2>
                                <div className="stars">{ratingStars}</div>
                                <div className="control-buttons">
                                    <i className={classNames(["play-pause", "fa", playPauseClass])}/>
                                    <i className="next fa fa-fast-forward"/>
                                </div>
                            </div>

                        </If>


                    </If>
                </div>
            </div>
        );
    }
}