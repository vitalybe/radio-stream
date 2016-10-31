import React, { Component } from 'react';
import classNames from 'classnames';

import { observer } from "mobx-react"

import navigator from '../stores/navigator'
import playlistCollection from '../stores/playlist_collection'

const logoImage = require("../images/logo.png");
const settingsImage = require("../images/settings.png");

@observer
export class PlaylistCollectionPage extends Component {
    constructor(props, context) {
        super(props, context);
    }

    //noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        playlistCollection.load();
    }

    render() {
        return (
            <div className="playlists-page">
                <img className="logo" src={logoImage}/>
                <div className="content">
                    <Choose>
                        <When condition={playlistCollection.loading}>
                            <div className="loader">
                                <div className="hexdots-loader spinner"></div>
                                <div className="status">{ playlistCollection.loadingAction }</div>
                                <If condition={playlistCollection.lastLoadingError}>
                                    <div className="last-error">
                                        <span className="prefix">Last error: </span>
                                        <span>{ playlistCollection.lastLoadingError }</span>
                                    </div>
                                </If>
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
