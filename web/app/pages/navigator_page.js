import React, {Component} from 'react';

import {observer} from "mobx-react"
import {HashRouter as Router, Route} from 'react-router-dom'

import playlistCollection from '../stores/playlist_collection'
import player from 'stores/player'
import navigator from 'stores/navigator'

import {StartUpPage} from './startup_page';
import {PlayerPage} from 'pages/player_page';
import {SettingsModificationsPage} from './settings_modifications_page'
import {FatalErrorPage} from './fatal_error_page'
import {Sidebar} from 'components/sidebar/sidebar_index'

class TopBarComponent extends Component {
  render() {
    return (
      <div className="top-bar">
      </div>
    )
  }
}


// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
@observer
export default class NavigatorPage extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let activeComponentStore = navigator.activeComponentStore;

    return (
      <div className="main">
        <div className="background"></div>
        <TopBarComponent/>
        <Router>
          <div>
            <Route path="/" exact={true} component={StartUpPage}/>
            <Route path="/settings" component={SettingsModificationsPage}/>
            <Sidebar />
          </div>
        </Router>
        <Choose>
          <When condition={navigator.fatalErrorMessage != null}>
            <FatalErrorPage />
          </When>
          <When condition={activeComponentStore === player}>
            <TopBarComponent hasBack/>
            <PlayerPage />
          </When>
        </Choose>
      </div>
    );
  }
}
