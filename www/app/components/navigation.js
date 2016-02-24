import React, { Component, PropTypes as T } from 'react';
import { Link } from 'react-router'
import classNames from 'classnames';

import * as musicActions from '../actions/music_actions';

export class Navigation extends Component {

    static propTypes = {
        playlistsAsync: React.PropTypes.shape({
            inProgress: React.PropTypes.bool.isRequired,
            error: React.PropTypes.any,
            data: React.PropTypes.any
        }).isRequired,
        currentPlaylist: T.string
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {

        return (
            <div>
                <div className="playlists">
                    <h1 className="header">Playlists</h1>
                    <div className="content">
                        <If condition={this.props.playlistsAsync.inProgress}>
                            <div className="hexdots-loader loader">
                                Loading...
                            </div>

                            <Else/>

                            <ul>
                                {this.props.playlistsAsync.data.map(playlist => {
                                    return (
                                        <li key={playlist}
                                            className={classNames(["playlist"],{"current": playlist == this.props.currentPlaylist})}>
                                            <If condition={playlist == this.props.currentPlaylist}>

                                                <span>
                                                    <i className="icon fa fa-volume-up"/>
                                                    <span className="name">{playlist}</span>
                                                </span>

                                                <Else/>

                                                <span>
                                                    <i className="icon fa fa-music"/>
                                                    <Link to={`/playlist/${playlist}`}>
                                                        <span className="name">{playlist}</span>
                                                    </Link>
                                                </span>
                                            </If>
                                        </li>)
                                })}
                            </ul>
                        </If>
                    </div>
                </div>
            </div>
        );
    }
}