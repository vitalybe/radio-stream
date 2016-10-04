import React, { Component } from 'react';
import classNames from 'classnames';

import { observer } from "mobx-react"

import store from '../stores/store'
import navigator from '../actions/navigator'

const logoImage = require("../images/logo.png");
const settingsImage = require("../images/settings.png");

@observer
export class PlaylistCollectionPage extends Component {
    constructor(props, context) {
        super(props, context);
    }

    //noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        store.playlistCollection.load();
    }

    render() {
        let playlistCollection = store.playlistCollection;

        return (
            <div className="playlists-page">
                <img className="logo" src={logoImage}/>
                <div className="content">
                    <Choose>
                        <When condition={playlistCollection.loading}>
                            <div className="hexdots-loader loader">
                                Loading...
                            </div>
                        </When>
                        <Otherwise>
                            <div>
                                {playlistCollection.items.map(playlist => {
                                    return (
                                        <button key={playlist.name}
                                                className="playlist"
                                                onClick={() => navigator.activatePlayer(playlist) }>
                                            {playlist.name}
                                        </button>)
                                })}
                            </div>
                        </Otherwise>
                    </Choose>
                </div>
                <button className="settings" onClick={() => navigator.activateSettings()}>
                    <img src={settingsImage}/>
                </button>
            </div>
        );
    }
}
