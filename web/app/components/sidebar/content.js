import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import Spinner from 'components/spinner'
import navigator from 'stores/navigator'
import playlistCollection from 'stores/playlist_collection'
import {getSettings} from 'stores/settings'

const settingsImage = require("../../images/settings.png");
const playlistImage = require("../../images/playlist.png");
const plusImage = require("../../images/plus.png");
const ellipsisImage = require("../../images/ellipsis.png");

export class Content extends Component {

  constructor(props, context) {
    super(props, context);
  }

  async componentDidMount() {
    let logger = loggerCreator("componentDidMount", moduleLogger);
    logger.info(`start`);

    await getSettings().load();
    logger.info(`settings loaded`);

    if (getSettings().address && getSettings().password) {
      logger.info(`settings exists`);
      playlistCollection.load();
    } else {
      logger.info(`no settings`);
      navigator.activateSettings();
    }
  }

  render() {
    return (
      <div className="content" style={{width: this.props.width + "em", left: this.props.left + "em"}}>
        <div className="title">Radio Stream</div>
        <button className="settings">
          <img className="icon" src={settingsImage}/>
          <span>Settings</span>
        </button>
        <div className="title">Playlists</div>
        <div className="playlists">
          {
            playlistCollection.loading
              ? <Spinner action={playlistCollection.loadingAction} error={playlistCollection.loadingError}/>
              : (
                <button className="playlist">
                  <img className="icon" src={playlistImage}/>
                  <img className="context-menu" src={ellipsisImage}/>
                  <span>All Music</span>
                </button>
              )
          }
        </div>
        <button className="new-playlist">
          <img className="icon" src={plusImage}/>
          <span>Create playlist</span>
        </button>
      </div>
    )
  }
}