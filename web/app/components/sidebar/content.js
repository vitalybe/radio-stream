import React, {Component} from 'react';

const settingsImage = require("../../images/settings.png");
const playlistImage = require("../../images/playlist.png");
const plusImage = require("../../images/plus.png");
const ellipsisImage = require("../../images/ellipsis.png");

export class Content extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="content" style={{width: this.props.width + "em", left: this.props.left + "em"}}>
        <div className="title">Radio Stream</div>
        <button className="settings">
          <img className="icon" src={settingsImage}/>
          <span>Settings</span>
        </button>
        <div className="title">Playlists</div>
        <div className="playlists">
          <button className="playlist">
            <img className="icon" src={playlistImage}/>
            <img className="context-menu" src={ellipsisImage}/>
            <span>All Music</span>
          </button>
        </div>
        <button className="new-playlist">
          <img className="icon" src={plusImage}/>
          <span>Create playlist</span>
        </button>
      </div>
    )
  }
}