import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';

import { Navigation } from '../components/navigation.js'
import * as musicActions from '../actions/music_actions';


@connect(state => {
    return {
        currentPlaylist: state.currentPlaylist,
        playlistsAsync: state.playlistsAsync,
        currentSongAsync: state.currentSongAsync,
        isPlaying: state.isPlaying,
        currentArtist: state.currentArtist
    };
})
export class PlaylistPage extends Component {

    constructor(props, context) {
        super(props, context);
        if (!this.props.playlistsAsync.data) {
            this.props.dispatch(musicActions.loadAvailablePlaylists());
        }
    }

    componentDidMount() {
        // For the first time the playlist page is shown
        this.props.dispatch(musicActions.startPlayingPlaylistAction(this.props.params.playlistName));
    }

    componentWillReceiveProps(nextProps) {
        // This seems to be the correct way of handling that:
        // Per: http://stackoverflow.com/questions/32846337/how-to-fetch-the-new-data-in-response-to-react-router-change-with-redux
        if (nextProps.params.playlistName !== this.props.params.playlistName) {
            this.props.dispatch(musicActions.startPlayingPlaylistAction(nextProps.params.playlistName));
        }
    }

    onPlayPause() {
        var action = musicActions.playTogglePlaylistAction(this.props.params.playlistName, this.props.currentSongAsync.data);
        this.props.dispatch(action);
    }

    onNext() {
        var action = musicActions.playNextSongAction(this.props.params.playlistName, this.props.currentSongAsync.data);
        this.props.dispatch(action);
    }

    onChangeRating(newRating) {
        var action = musicActions.changeRating(this.props.currentSongAsync.data, newRating);
        this.props.dispatch(action);
    }

    render() {
        let playPauseClass = this.props.isPlaying ? "fa-pause" : "fa-play";
        let currentSongAsync = this.props.currentSongAsync;
        let ratingStars = null;
        if (currentSongAsync.data) {
            let starCount = currentSongAsync.data.rating / 20;
            ratingStars = _.range(5).map(starIndex => {
                let starClass = starCount > starIndex ? "fa-star" : "fa-star-o";
                let newRating = (starIndex + 1) * 20;
                return <i key={starIndex} className={classNames(["fa", starClass])}
                          onClick={() => this.onChangeRating(newRating)}/>;
            });
        }

        return (
            <div className="playlist-page">
                <div className="sidebar">
                    <Navigation playlistsAsync={this.props.playlistsAsync}
                                currentPlaylist={this.props.params.playlistName}/>
                </div>
                <div className="main">
                    <If condition={this.props.currentSongAsync.inProgress}>

                        /********* Loader **********/
                        <div className="loader hexdots-loader"></div>

                        <Else/>

                        <If condition={this.props.currentSongAsync.error}>

                            /********* Error **********/
                            <div className="critical-error">Fa-Error</div>

                            <Else/>

                            /********* Player **********/
                            <div className="player">
                                <h1 className="track-name">{currentSongAsync.data.name}</h1>
                                <h2 className="track-artist">{currentSongAsync.data.artist}</h2>
                                <div className="stars">{ratingStars}</div>
                                <div className="control-buttons">
                                    <button onClick={this.onPlayPause.bind(this)}><i
                                        className={classNames(["play-pause", "fa", playPauseClass])}/></button>
                                    <button onClick={this.onNext.bind(this)}><i className="next fa fa-fast-forward"/>
                                    </button>
                                </div>
                                <div>Last played: {moment.unix(this.props.currentSongAsync.data.lastPlayed).fromNow()}</div>
                                <div>Play count: {this.props.currentSongAsync.data.playCount}</div>
                                <div className="art">
                                    <If condition={this.props.currentArtist && this.props.currentArtist.image.length > 0}>
                                        <img src={this.props.currentArtist.image[2]["#text"]} alt=""/>
                                    </If>
                                </div>
                            </div>

                        </If>


                    </If>
                </div>
            </div>
        );
    }
}