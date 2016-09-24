import React, { Component } from 'react';
import classNames from 'classnames';

import { observer } from "mobx-react"

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
            <div className="playlists">
                <h1 className="header">Playlists</h1>
                <div className="content">
                    <Choose>
                        <When condition={playlists.loading}>
                            <div className="hexdots-loader loader">
                                Loading...
                            </div>
                        </When>
                        <Otherwise>
                            <ul>
                                {playlists.items.map(playlist => {
                                    return (
                                        <li key={playlist.name}
                                            className={classNames(["playlist"])}>

                                            <i className="icon fa fa-music"/>
                                            <a href="#" onClick={() => playlists.selectPlaylist(playlist)}>
                                                {playlist.name}
                                            </a>
                                        </li>)
                                })}
                            </ul>
                        </Otherwise>
                    </Choose>
                </div>
            </div>
        );
    }
}
