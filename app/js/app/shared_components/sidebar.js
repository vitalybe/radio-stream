import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Animated, PanResponder } from "react-native";
import { observer } from "mobx-react";
import { colors } from "app/styles/styles";

const SCRUB_WIDTH = 30;
const MIN_SPEED_TO_TOGGLE_SIDEBAR = 0.1;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 54,
    bottom: -1,
    flexDirection: "row",
    zIndex: 10,
  },
  scrub: {
    width: SCRUB_WIDTH,
    backgroundColor: "transparent",
  },
  sidebar: {
    borderWidth: 1,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
  },
});

@observer
export default class Sidebar extends Component {
  componentWillMount() {
    this.openPosition = -2 - SCRUB_WIDTH;
    this.closePosition = this.openPosition - this.props.width;
    this.state = { positionAnimation: new Animated.Value(this.targetAnimatedPosition(this.props.isOpen)) };

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderTerminate,
    });
  }

  componentWillReceiveProps(nextProps) {
    loggerCreator("componentWillReceiveProps", moduleLogger);
    // width may change on a resize event, thus affecting the closePosition
    this.closePosition = this.openPosition - nextProps.width;

    if (nextProps.isOpen !== this.props.isOpen) {
      this.slideSidebar(nextProps.isOpen);
    } else {
      this.state.positionAnimation.setValue(this.targetAnimatedPosition(nextProps.isOpen));
    }
  }

  releaseSidebarFromGesture(gestureState) {
    let logger = loggerCreator("releaseSidebarFromGesture", moduleLogger);
    this.state.positionAnimation.flattenOffset();

    logger.info(`velocity x: ${gestureState.vx}`);
    let toOpen = null;
    if (Math.abs(gestureState.vx) > MIN_SPEED_TO_TOGGLE_SIDEBAR) {
      toOpen = this.adjustMovementBySide(gestureState.vx) > MIN_SPEED_TO_TOGGLE_SIDEBAR;
    } else {
      toOpen = !this.props.isOpen;
    }

    this.slideSidebar(toOpen);
  }

  adjustMovementBySide(value) {
    return this.props.fromLeft ? value : -value;
  }

  targetAnimatedPosition(isOpen) {
    return isOpen ? this.openPosition : this.closePosition;
  }

  onMoveShouldSetPanResponder = (evt, gestureState) => {
    return gestureState.numberActiveTouches > 0 && Math.abs(gestureState.dx) > 10;
  };

  onPanResponderGrant = () => {
    loggerCreator("onPanResponderGrant", moduleLogger);
    this.state.positionAnimation.setOffset(this.state.positionAnimation._value);
    this.state.positionAnimation.setValue(0);
  };

  onPanResponderMove = (evt, gestureState) => {
    this.state.positionAnimation.setValue(this.adjustMovementBySide(gestureState.dx));
  };

  onPanResponderTerminate = (evt, gestureState) => {
    loggerCreator("onPanResponderTerminate", moduleLogger);
    this.releaseSidebarFromGesture(gestureState);
  };

  onPanResponderRelease = (evt, gestureState) => {
    loggerCreator("onPanResponderRelease", moduleLogger);
    this.releaseSidebarFromGesture(gestureState);
  };

  slideSidebar(isOpen) {
    const logger = loggerCreator("slideSidebar", moduleLogger);

    Animated.timing(this.state.positionAnimation, {
      toValue: this.targetAnimatedPosition(isOpen),
      duration: 200,
    }).start(status => {
      logger.info(`animation finished (${status.finished})?`);
      if (status.finished) {
        logger.info(`modifying master store property to: ${isOpen}`);
        this.props.onChangeOpen(isOpen);
      }
    });
  }

  render() {
    const targetSide = this.props.fromLeft ? "left" : "right";
    const targetRoundedCorner = this.props.fromLeft ? "borderTopRightRadius" : "borderTopLeftRadius";

    const scrubs = this.props.enableScrubs ? <View style={[styles.scrub]} /> : null;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            [targetSide]: this.state.positionAnimation.interpolate({
              inputRange: [this.closePosition, this.openPosition],
              outputRange: [this.closePosition, this.openPosition],
              extrapolate: "clamp",
            }),
          },
        ]}
        {...this.panResponder.panHandlers}>
        {scrubs}
        <View
          style={[
            styles.sidebar,
            {
              width: this.props.width,
              [targetRoundedCorner]: 5,
            },
          ]}>
          {this.props.children}
        </View>
        {scrubs}
      </Animated.View>
    );
  }
}

Sidebar.propTypes = {
  width: React.PropTypes.number.isRequired,
  fromLeft: React.PropTypes.bool.isRequired,

  isOpen: React.PropTypes.bool.isRequired,
  onChangeOpen: React.PropTypes.func.isRequired,

  enableScrubs: React.PropTypes.bool,
};
