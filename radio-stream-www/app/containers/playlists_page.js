import React, { Component } from 'react';
import classNames from 'classnames';

import { observer } from "mobx-react"

const logoImage = require("../images/logo.png");

@observer
export class PlaylistsPage extends Component {
    constructor(props, context) {
        super(props, context);
    }

    //noinspection JSUnusedGlobalSymbols
    componentDidMount() {
        this.props.playlists.load();
    }

    render() {
        let playlists = this.props.playlists;

        return (
            <div className="playlists-page">
                <img className="logo" src={logoImage}/>
                <div className="content">
                    <Choose>
                        <When condition={playlists.loading}>
                            <div className="hexdots-loader loader">
                                Loading...
                            </div>
                        </When>
                        <Otherwise>
                            <div>
                                {playlists.items.map(playlist => {
                                    return (
                                        <button key={playlist.name}
                                                className="playlist"
                                                onClick={() => playlists.selectPlaylist(playlist)}>
                                            {playlist.name}
                                        </button>)
                                })}
                            </div>
                        </Otherwise>
                    </Choose>
                </div>
            </div>
        );
    }
}
