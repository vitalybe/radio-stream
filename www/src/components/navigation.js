require('./../styles/hexdots.css');

import React, { Component, PropTypes as T } from 'react';

export class Navigation extends Component {

    static propTypes = {
        playlistsAsync: React.PropTypes.shape({
            inProgress: React.PropTypes.bool.isRequired,
            error: React.PropTypes.any,
            data: React.PropTypes.any
        }).isRequired,
        activePlaylist: T.string
    };

    render() {

        return (
            <div>
                <h1>Playlists</h1>
                <If condition={this.props.playlistsAsync.inProgress}>
                    <div className="hexdots-loader">
                        Loading...
                    </div>

                    <Else/>

                    <ul>
                        {this.props.playlists.map(playlist => {
                            return <li>{playlist}</li>
                        })}
                    </ul>
                </If>
            </div>
        );
    }
}