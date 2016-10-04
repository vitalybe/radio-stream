import React, { Component } from 'react';

import { observer } from "mobx-react"

import Settings from '../stores/settings_modifications'
import PlaylistCollection from '../stores/playlist_collection'
import Player from '../stores/player'

import { PlaylistCollectionPage } from './playlist_collection_page';
import { PlayerPage } from './player_page';
import { SettingsModificationsPage } from './settings_modifications_page'
import { FatalErrorPage } from './fatal_error_page'

import store from '../stores/store'
import navigator from '../actions/navigator'

// Inspired by: https://github.com/mobxjs/mobx-contacts-list/blob/6c8e889f1bc84644d91ee0043b7c5e0a4482195c/src/app/stores/view-state.js
@observer
export default class Routing extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        let activeComponentStore = store.activeComponentStore;

        return (
            <div className="main">
                <div className="background"></div>
                <div className="top-bar">
                    <If condition={activeComponentStore instanceof PlaylistCollection === false}>
                        <div className="back" onClick={() => navigator.activatePlaylistCollection()}></div>
                    </If>
                </div>
                <Choose>
                    <When condition={activeComponentStore instanceof Settings}>
                        <SettingsModificationsPage />
                    </When>
                    <When condition={activeComponentStore instanceof PlaylistCollection}>
                        <PlaylistCollectionPage />
                    </When>
                    <When condition={activeComponentStore instanceof Player}>
                        <PlayerPage />
                    </When>
                    <When condition={activeComponentStore instanceof FatalError}>
                        <FatalErrorPage />
                    </When>
                    <Otherwise>
                        {/* TODO: ERROR */}
                        ERROR
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}
