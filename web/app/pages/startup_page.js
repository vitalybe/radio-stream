import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import {observer} from "mobx-react"
import navigator from 'stores/navigator'
import playlistCollection from 'stores/playlist_collection'
import {getSettings} from 'stores/settings'
import sidebarStore from 'stores/sidebar_store'

const logoImage = require("images/logo.png");

@observer
export class StartUpPage extends Component {
  constructor(props, context) {
    super(props, context);

    sidebarStore.isOpen = true;
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
