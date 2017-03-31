import React, {Component} from 'react';
import classNames from 'classnames';
import {Motion, spring, presets} from 'react-motion';

const sidebarImage = require("../images/sidebar.png");
const settingsImage = require("../images/settings.png");
const playlistImage = require("../images/playlist.png");
const plusImage = require("../images/plus.png");
const ellipsisImage = require("../images/ellipsis.png");


export class Sidebar extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      open: true,
    }
  }

  onSidebarIconClick = () => {
    this.setState({open: !this.state.open})
  }

  getSidebarLeft = () => {
    const leftOpen = 0;
    const leftClosed = -20*2;

    return this.state.open ? [leftClosed, leftOpen] : [leftOpen, leftClosed];
  }

  render() {
    let [sidebarLeftStart, sidebarLeftEnd] = this.getSidebarLeft();

    return (
      <div className="sidebar">
        <img className="open-close" src={sidebarImage} onClick={this.onSidebarIconClick}/>
        <Motion defaultStyle={{left: sidebarLeftStart}} style={{left: spring(sidebarLeftEnd, ...presets.stiff)}}>
          {value => {
            return <div className="content" style={{left: value.left ? value.left + "em" : value.left}}>
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
          }
          }
        </Motion>
      </div>
    )
  }
}