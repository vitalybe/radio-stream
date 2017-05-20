import loggerCreator from '../utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import {observer} from "mobx-react"
import classNames from 'classnames';
import moment from 'moment';
import Spinner from '../components/spinner'
import player from '../stores/player'
import playlistCollection from '../stores/playlist_collection'
import DropdownMenu from 'react-dd-menu';

require("react-dd-menu/dist/react-dd-menu.css");
const infoImage = require("../images/info.png");
const ellipsisImage = require("../images/ellipsis.png");

@observer
export class PlayerPage extends Component {

  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {
      contextMenuOpen: false
    }

    await this.playPlaylist(this.props.match.params.name);
  }

  componentWillUnmount() {
    player.stop();
  }

  async componentWillReceiveProps(nextProps) {
    let logger = loggerCreator("componentWillReceiveProps", moduleLogger);
    logger.info(`start`);

    await this.playPlaylist(nextProps.match.params.name);
  }

  async playPlaylist(playlistName) {
    let logger = loggerCreator("playPlaylist", moduleLogger);
    logger.info(`start`);
    
    logger.info(`playlist name: ${playlistName}`);
    const playlist = await playlistCollection.playlistByName(playlistName)
    if (playlist) {
      logger.info(`playlist found`);
      await player.changePlaylist(playlist);
      player.play();
    } else {
      throw new Error(`playlist not found: ${playlistName}`)
    }
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

  async deleteSong() {
    let logger = loggerCreator("deleteSong", moduleLogger);
    logger.info(`start`);

    let song = player.song;
    if (song) {
      player.next();
      song.markAsDeleted()
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
            <Spinner action={player.loadingAction}
                     error={player.loadingError}/>
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
                <div className="stars">
                  {ratingStars}
                  <DropdownMenu
                    isOpen={this.state.contextMenuOpen}
                    close={() => this.setState({contextMenuOpen: false})}
                    toggle={<img className="context-menu" src={ellipsisImage}
                                 onClick={() => this.setState({contextMenuOpen: !this.state.contextMenuOpen})}/>}>
                    <li><a href="#" onClick={() => this.onChangeRating(0)}>Clear rating</a></li>
                    <li><a href="#" onClick={() => this.deleteSong()}>Delete song</a></li>
                  </DropdownMenu>
                </div>
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