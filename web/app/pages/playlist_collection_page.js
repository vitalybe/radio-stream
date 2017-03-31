import loggerCreator from '../utils/logger'
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import {observer} from "mobx-react"
import Spinner from 'components/spinner'
import navigator from 'stores/navigator'
import playlistCollection from 'stores/playlist_collection'
import {getSettings} from 'stores/settings'

const logoImage = require("images/logo.png");
const settingsImage = require("images/settings.png");

@observer
export class PlaylistCollectionPage extends Component {
  constructor(props, context) {
    super(props, context);
  }

  //noinspection JSUnusedGlobalSymbols
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
      <div className="playlists-page">
        <img className="logo" src={logoImage}/>
        <div className="content">
          <Choose>
            <When condition={playlistCollection.loading}>
              <Spinner action={playlistCollection.loadingAction}
                       error={playlistCollection.loadingError}/>
            </When>
            <Otherwise>
              <div>
                {playlistCollection.items.map(playlist => {
                  return (
                    <button key={playlist.name}
                            className="playlist"
                            onClick={() => navigator.activatePlayer(playlist) }>
                      {playlist.name}
                    </button>)
                })}
              </div>
            </Otherwise>
          </Choose>
        </div>
        <button className="settings" onClick={() => navigator.activateSettings()}>
          <img src={settingsImage}/>
        </button>
      </div>
    );
  }
}
