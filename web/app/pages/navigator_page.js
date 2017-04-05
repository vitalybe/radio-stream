import React, {Component} from 'react';

import {observer} from "mobx-react"
import {HashRouter as Router, Route} from 'react-router-dom'

import player from 'stores/player'
import navigator from 'stores/navigator'

import {StartUpPage} from './startup_page';
import {PlayerPage} from 'pages/player_page';
import {SettingsModificationsPage} from './settings_modifications_page'
import {FatalErrorPage} from './fatal_error_page'
import {Sidebar} from 'components/sidebar/sidebar'
import {getSettings} from 'stores/settings'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
@observer
export default class NavigatorPage extends Component {
  async componentWillMount() {
    this.state = {ready: false}
    await getSettings().load();
    this.setState({ready: true})
  }

  render() {
    let activeComponentStore = navigator.activeComponentStore;

    return (
      <div className="main">
        <div className="background"></div>
        {
          this.state.ready
            ? (
              <Router>
                <div>
                  <Route path="/" exact={true} component={StartUpPage}/>
                  <Route path="/settings" component={SettingsModificationsPage}/>
                  <Sidebar />
                </div>
              </Router>
            )
            : null
        }
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
