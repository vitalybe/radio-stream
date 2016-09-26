import React, { Component } from 'react';

import { observer } from "mobx-react"

import Settings from '../stores/settings'
import PlaylistCollection from '../stores/playlist_collection'
import Player from '../stores/player'

import { PlaylistCollectionPage } from './playlist_collection_page';
import { PlayerPage } from './player_page';


@observer
export default class RadioStreamApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.navigator = this.props.navigator;
    }

    render() {
        let activeComponent = this.navigator.activeComponent;

        return (
            <div className="main">
                <div className="background"></div>
                <Choose>
                    <When condition={activeComponent instanceof Settings}>
                        <SettingsPage player={activeComponent}
                                      navigator={this.navigator}/>
                    </When>
                    <When condition={activeComponent instanceof PlaylistCollection}>
                        <PlaylistCollectionPage playlists={activeComponent}
                                                navigator={this.navigator}/>
                    </When>
                    <When condition={activeComponent instanceof Player}>
                        <PlayerPage player={activeComponent}
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
