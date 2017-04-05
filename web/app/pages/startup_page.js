import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import {observer} from "mobx-react"
import sidebarStore from 'stores/sidebar_store'
import playlistCollection from 'stores/playlist_collection'
import {getSettings} from 'stores/settings'
import navigator from 'stores/navigator'

const logoImage = require("images/logo.png");

@observer
export class StartUpPage extends Component {

  async componentDidMount() {
    let logger = loggerCreator("componentDidMount", moduleLogger);
    logger.info(`start`);

    sidebarStore.isOpen = true;

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
      <div className="startup-page">
        <img className="logo" src={logoImage}/>
        <div className="text">Choose a playlist to start</div>
      </div>
    );
  }
}
