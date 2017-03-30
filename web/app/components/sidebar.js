import React, {Component} from 'react';
import {connect} from 'react-redux';
const sidebarImage = require("../images/sidebar.png");
const settingsImage = require("../images/settings.png");
const playlistImage = require("../images/playlist.png");
const plusImage = require("../images/plus.png");
const ellipsisImage = require("../images/ellipsis.png");


export class Sidebar extends Component {

  render() {
    return (
      <div className="sidebar">
        <img className="open-close" src={sidebarImage}/>
        <div className="content">
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
      </div>
    )
  }
}