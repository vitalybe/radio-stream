import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

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
import playlistCollection from 'stores/playlist_collection'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
@observer
export default class NavigatorPage extends Component {
  async componentWillMount() {
    let logger = loggerCreator("componentWillMount", moduleLogger);
    logger.info(`start`);

    this.state = {
      ready: false,
    }
    await getSettings().load();

    if (getSettings().address && getSettings().password) {
      logger.info(`settings exists`);
      await playlistCollection.load();
    } else {
      logger.info(`no settings`);
      // BROKEN! TBD
    }

    this.setState({
      ready: true
    })
  }

  render() {

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
                  <Route path="/playlist/:name" component={PlayerPage}/>
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
        </Choose>
      </div>
    );
  }
}
