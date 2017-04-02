import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import Spinner from 'components/spinner'
import navigator from 'stores/navigator'
import sidebarStore from 'stores/sidebar_store.js'
import playlistCollection from 'stores/playlist_collection'

const settingsImage = require("../../images/settings.png");
const playlistImage = require("../../images/playlist.png");
const plusImage = require("../../images/plus.png");
const ellipsisImage = require("../../images/ellipsis.png");

export class Content extends Component {

  constructor(props, context) {
    super(props, context);
  }

  onPlaylistClicked = (playlist) => {
    navigator.activatePlayer(playlist);
    sidebarStore.isOpen = false;
  }

  onSettingsClicked = () => {
    navigator.activateSettings();
    sidebarStore.isOpen = false;
  }


  render() {
    return (
      <div className="content" style={{width: this.props.width + "em", left: this.props.left + "em"}}>
        <div className="title">Radio Stream</div>
        <button className="settings" onClick={this.onSettingsClicked}>
          <img className="icon" src={settingsImage}/>
          <span>Settings</span>
        </button>
        <div className="title">Playlists</div>
        <div className="playlists">
          {
            playlistCollection.loading
              ? <Spinner action={playlistCollection.loadingAction} error={playlistCollection.loadingError}/>
              : playlistCollection.items.map(playlist => {
                return (
                  <button className="playlist" key={playlist.name}
                          onClick={() => this.onPlaylistClicked(playlist)}>
                    <img className="icon" src={playlistImage}/>
                    <img className="context-menu" src={ellipsisImage}/>
                    <span>{playlist.name}</span>
                  </button>
                )
              })
          }
        </div>
        <button className="new-playlist">
          <img className="icon" src={plusImage}/>
          <span>Create playlist</span>
        </button>
      </div>
    )
  }
}