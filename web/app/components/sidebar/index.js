import React, {Component} from 'react';
import {Motion, spring, presets} from 'react-motion';
import {Content} from './content'

const sidebarImage = require("../../images/sidebar.png");


export class Sidebar extends Component {

  constructor(props, context) {
    super(props, context);
    this.width = 20;

    this.state = {
      open: true,
    }
  }

  onSidebarIconClick = () => {
    this.setState({open: !this.state.open})
  }

  getSidebarLeft = () => {
    const leftOpen = 0;
    const leftClosed = -this.width * 2;

    return this.state.open ? [leftClosed, leftOpen] : [leftOpen, leftClosed];
  }

  render() {
    let [sidebarLeftStart, sidebarLeftEnd] = this.getSidebarLeft();

    return (
      <div className="sidebar">
        <img className="open-close" src={sidebarImage} onClick={this.onSidebarIconClick}/>
        <Motion defaultStyle={{left: sidebarLeftStart}} style={{left: spring(sidebarLeftEnd, ...presets.stiff)}}>
          { value => <Content width={this.width} left={value.left}/> }
        </Motion>
      </div>
    )
  }
}