import loggerCreator from '../utils/logger'
var moduleLogger = loggerCreator(__filename);

import React, { Component } from 'react';
import { observer } from "mobx-react"
import classNames from 'classnames';
import moment from 'moment';

import assert from "../utils/assert"

import * as idleRedirectListener from '../utils/idle_redirect_listener';

import player from '../stores/player'

const infoImage = require("../images/info.png");

@observer
export class PlayerPage extends Component {

    constructor(props, context) {
        super(props, context);
    }

    //noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        // TODO: Move idleRedirectListener to view independent service
        idleRedirectListener.start();
    }

    //noinspection JSUnusedGlobalSymbols
    componentWillUnmount() {
        player.stop();
    }

    onPlayPause() {
        player.togglePlayPause();
    }

    onNext() {
        player.next();
    }

    onChangeRating(newRating) {
        let logger = loggerCreator(this.onChangeRating.name, moduleLogger);
        logger.info(`start`);

        let song = player.song;
        if (song) {
            song.changeRating(newRating);
        } else {
            logger.error("song doesn't exist")
        }
    }

    render() {
        let song = player.song;

        let playPauseClass = player.isPlaying ? "pause" : "play";
        let ratingStars = null;
        if (song) {
            let starCount = song.rating / 20;
            ratingStars = _.range(5).map(starIndex => {
                let starClass = starCount > starIndex ? "star-full" : "star-empty";
                let newRating = (starIndex + 1) * 20;
                return <i key={starIndex} className={classNames([starClass])}
                          onClick={() => this.onChangeRating(newRating)}/>;
            });
        }

        return (
            <div className="player-page">
                <Choose>
                    <When condition={player.isLoading}>
                        <div className="loader hexdots-loader"></div>
                    </When>
                    <Otherwise>
                        <div className="player">
                            <div className="centre-column">
                                <div className="art">
                                    <div className="metadata">
                                        <div><img className="info" src={infoImage}/></div>
                                        <div><b>Last
                                            played:</b> {moment.unix(song.lastplayed).fromNow()}
                                        </div>
                                        <div><b>Play count:</b> {song.playcount}</div>
                                        <div><b>Marked as played:</b> {song.isMarkedAsPlayed ? "✔" : "x"}
                                        </div>
                                    </div>
                                    <If condition={song.loadedImageUrl}>
                                        <img className="artist" src={song.loadedImageUrl} alt=""/>
                                    </If>
                                </div>
                                <div className="stars">{ratingStars}</div>
                                <div className="names">
                                    <div>{song.title}</div>
                                    <div className="artist-name">{song.artist}</div>
                                    <div>{song.album}</div>
                                </div>
                                <div className="control-buttons">
                                    <button className={classNames(["play-pause", playPauseClass])}
                                            onClick={this.onPlayPause.bind(this)}/>
                                    <button className="next" onClick={this.onNext.bind(this)}/>
                                </div>
                            </div>
                        </div>
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}