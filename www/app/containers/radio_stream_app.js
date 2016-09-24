import React, { Component } from 'react';

import { observer } from "mobx-react"
import store from "../stores/store"

import { PlaylistsPage } from './playlists_page';
import { PlayerPage } from './player_page';

@observer
export default class RadioStreamApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.store = this.props.store;
    }

    render() {
        return (
            <div>
                <Choose>
                    <When condition={this.store.player}>
                        <PlayerPage player={this.store.player} />
                    </When>
                    <Otherwise>
                        <PlaylistsPage playlists={this.store.playlistMetadataCollection} />
                    </Otherwise>
                </Choose>
            </div>
        );
    }
}
