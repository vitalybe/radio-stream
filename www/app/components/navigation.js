import React, { Component, PropTypes as T } from 'react';
import { Link } from 'react-router'
import classNames from 'classnames';

import { observer } from "mobx-react"
import * as musicActions from '../actions/music_actions';


export class Navigation extends Component {

    static propTypes = {
        playlists: React.PropTypes.shape({
            loading: React.PropTypes.bool.isRequired,
            error: React.PropTypes.any,
            items: React.PropTypes.any
        }).isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {

        return (
            <div className="playlists">
                <h1 className="header">Playlists</h1>
                <div className="content">
                    <Choose>
                        <When condition={this.props.playlists.loading}>
                            <div className="hexdots-loader loader">
                                Loading...
                            </div>
                        </When>
                        <Otherwise>
                            <ul>
                                {this.props.playlists.items.map(playlist => {
                                    return (
                                        <li key={playlist.name}
                                            className={classNames(["playlist"])}>

                                            <i className="icon fa fa-music"/>
                                            <Link to={`/playlist/${playlist.name}`}>
                                                <span className="name">{playlist.name}</span>
                                            </Link>
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