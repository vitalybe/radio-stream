import loggerCreator from 'utils/logger'
const moduleLogger = loggerCreator(__filename);

import React, {Component} from 'react';
import {Motion, spring, presets} from 'react-motion';
import sidebarStore from 'stores/sidebar_store.js'
import {Content} from './sidebar_content'
import {observer} from "mobx-react"

const sidebarImage = require("../../images/sidebar.png");

@observer
export class Sidebar extends Component {

  constructor(props, context) {
    super(props, context);
    this.width = 20;
  }

  onSidebarIconClick = () => {
    let logger = loggerCreator("onSidebarIconClick", moduleLogger);
    logger.info(`start. Is open: ${sidebarStore.isOpen}`);

    sidebarStore.isOpen = !sidebarStore.isOpen
  }

  getSidebarLeft = () => {
    let logger = loggerCreator("getSidebarLeft", moduleLogger);
    logger.info(`start: ${sidebarStore.isOpen}`);

    const leftOpen = 0;
    const leftClosed = -this.width * 2;

    return sidebarStore.isOpen ? [leftClosed, leftOpen] : [leftOpen, leftClosed];
  }

  render() {
    let logger = loggerCreator("render", moduleLogger);
    logger.info(`start`);

    let [sidebarLeftStart, sidebarLeftEnd] = this.getSidebarLeft();

    return (
      <div className="sidebar">
        <img className="open-close" src={sidebarImage} onClick={this.onSidebarIconClick}/>
        <Motion defaultStyle={{left: sidebarLeftStart}} style={{left: spring(sidebarLeftEnd, ...presets.stiff)}}>
          { value => <Content width={this.width} left={value.left} /> }
        </Motion>
      </div>
    )
  }
}
