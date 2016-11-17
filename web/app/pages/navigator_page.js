import React, { Component } from 'react';

import { observer } from "mobx-react"

import settings from '../stores/settings_modifications'
import playlistCollection from '../stores/playlist_collection'
import player from '../stores/player'
import navigator from '../stores/navigator'

import { PlaylistCollectionPage } from './playlist_collection_page';
import { PlayerPage } from './player_page';
import { SettingsModificationsPage } from './settings_modifications_page'
import { FatalErrorPage } from './fatal_error_page'

class TopBarComponent extends Component {
    render() {
        return (
            <div className="top-bar">
                <If condition={this.props.hasBack}>
                    <div className="back" onClick={() => navigator.activatePlaylistCollection()}></div>
                </If>
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
                <Choose>
                    <When condition={navigator.fatalErrorMessage != null}>
                        <TopBarComponent/>
                        <FatalErrorPage />
                    </When>
                    <When condition={activeComponentStore === playlistCollection}>
                        <TopBarComponent/>
                        <PlaylistCollectionPage />
                    </When>
                    <When condition={activeComponentStore === settings}>
                        <TopBarComponent hasBack />
                        <SettingsModificationsPage />
                    </When>
                    <When condition={activeComponentStore === player}>
                        <TopBarComponent hasBack />
                        <PlayerPage />
                    </When>
                </Choose>
            </div>
        );
    }
}
