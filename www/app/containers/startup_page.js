import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Navigation } from '../components/navigation.js'
import { observer } from "mobx-react"
import store from "../stores/store_mobx"

@observer
export class StartupPage extends Component {
    constructor(props, context) {
        super(props, context);
        if (!store.playlistsMetadata.loaded) {
            store.playlistsMetadata.loadAvailablePlaylists();
        }
    }

    render() {
        return (
            <div>
                <h1>Music stream</h1>
                <Navigation playlists={store.playlistsMetadata}/>
            </div>
        );
    }
}
