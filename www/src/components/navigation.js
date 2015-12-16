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
                    <h1>Playlists</h1>
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
                                            className={classNames({"current": playlist == this.props.currentPlaylist})}>
                                            <Link to={`/playlist/${playlist}`}>{playlist}</Link>
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