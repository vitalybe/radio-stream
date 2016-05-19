const infoImage = require("../images/info.png");

import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';

import { Navigation } from '../components/navigation.js'
import * as musicActions from '../actions/music_actions';
import * as idleRedirectListener from '../utils/idle_redirect_listener';

import { Link } from 'react-router'


@connect(state => {
    return {
        currentPlaylist: state.currentPlaylist,
        playlistsAsync: state.playlistsAsync,
        currentSongAsync: state.currentSongAsync,
        isPlaying: state.isPlaying,
        currentArtistImage: state.currentArtistImage,
        isMarkedAsPlayed: state.isMarkedAsPlayed
    };
})
export class PlaylistPage extends Component {

    constructor(props, context) {
        super(props, context);
        if (!this.props.playlistsAsync.data) {
            this.props.dispatch(musicActions.loadAvailablePlaylists());
        }

        idleRedirectListener.start();
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

    componentWillUnmount() {
        if(this.props.isPlaying) {
            musicActions.playTogglePlaylistAction(this.props.params.playlistName, this.props.currentSongAsync.data);
        }
        idleRedirectListener.stop();
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
        let playPauseClass = this.props.isPlaying ? "pause" : "play";
        let currentSongAsync = this.props.currentSongAsync;
        let ratingStars = null;
        if (currentSongAsync.data) {
            let starCount = currentSongAsync.data.itunes_rating / 20;
            ratingStars = _.range(5).map(starIndex => {
                let starClass = starCount > starIndex ? "star-full" : "star-empty";
                let newRating = (starIndex + 1) * 20;
                return <i key={starIndex} className={classNames([starClass])}
                          onClick={() => this.onChangeRating(newRating)}/>;
            });
        }

        return (
            <div className="playlist-page">
                <div className="main">
                    <div className="background"></div>
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
                                <div className="centre-column">
                                  <div className="art">
                                      <div className="metadata">
                                        <div><img className="info" src={infoImage} /></div>
                                        <div><b>Last played:</b> {moment.unix(this.props.currentSongAsync.data.itunes_lastplayed).fromNow()}</div>
                                        <div><b>Play count:</b> {this.props.currentSongAsync.data.itunes_playcount}</div>
                                        <div><b>Marked as played:</b> {this.props.isMarkedAsPlayed ? "✔" : "x"}</div>
                                      </div>
                                      <If condition={this.props.currentArtistImage}>
                                          <img className="artist" src={this.props.currentArtistImage} alt=""/>
                                      </If>
                                  </div>
                                  <div className="stars">{ratingStars}</div>
                                  <div className="names">
                                    <div>{currentSongAsync.data.title}</div>
                                    <div className="artist-name">{currentSongAsync.data.artist}</div>
                                    <div>{currentSongAsync.data.album}</div>
                                  </div>
                                  <div className="control-buttons">
                                      <button className={classNames(["play-pause", playPauseClass])} onClick={this.onPlayPause.bind(this)}/>
                                      <button className="next" onClick={this.onNext.bind(this)}/>
                                  </div>
                                </div>
                                <div className="current-playlist">
                                  <Link to={`/`}>
                                    {this.props.params.playlistName}
                                  </Link>
                                </div>
                            </div>

                        </If>
                    </If>
                </div>
            </div>
        );
    }
}