import React, { Component } from 'react';

import { observer } from "mobx-react"

import Settings from '../stores/settings_modifications'
import PlaylistCollection from '../stores/playlist_collection'
import Player from '../stores/player'
import FatalError from '../stores/fatal_error'

import { PlaylistCollectionPage } from './playlist_collection_page';
import { PlayerPage } from './player_page';
import { SettingsModificationsPage } from './settings_modifications_page'
import { FatalErrorPage } from './fatal_error_page'

const backImage = require("../images/back.png");

@observer
export default class RadioStreamApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.navigator = this.props.navigator;
    }

    render() {
        let activeComponentStore = this.navigator.activeComponentStore;

        return (
            <div className="main">
                <div className="background"></div>
                <div className="top-bar">
                    <If condition={activeComponentStore instanceof PlaylistCollection === false}>
                        <div className="back" onClick={() => this.navigator.activatePlaylistCollection()}></div>
                    </If>
                </div>
                <Choose>
                    <When condition={activeComponentStore instanceof Settings}>
                        <SettingsModificationsPage settingsModifications={activeComponentStore}
                                                   navigator={this.navigator}/>
                    </When>
                    <When condition={activeComponentStore instanceof PlaylistCollection}>
                        <PlaylistCollectionPage playlists={activeComponentStore}
                                                navigator={this.navigator}/>
                    </When>
                    <When condition={activeComponentStore instanceof Player}>
                        <PlayerPage player={activeComponentStore}
                                    navigator={this.navigator}/>
                    </When>
                    <When condition={activeComponentStore instanceof FatalError}>
                        <FatalErrorPage fatalError={activeComponentStore}
                                    navigator={this.navigator}/>
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
