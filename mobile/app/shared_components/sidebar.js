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
    });
  }

  componentWillReceiveProps(nextProps) {
    loggerCreator("componentWillReceiveProps", moduleLogger);
    this.slideSidebar(nextProps.isOpen);
  }

  adjustMovementBySide(value) {
    return this.props.fromLeft ? value : -value;
  }

  targetAnimatedPosition(isOpen) {
    return isOpen ? this.openPosition : this.closePosition;
  }

  onMoveShouldSetPanResponder = (evt, gestureState) => {
    return gestureState.numberActiveTouches > 0 && Math.abs(gestureState.dx) > 1;
  };

  onPanResponderGrant = () => {
    loggerCreator("onPanResponderGrant", moduleLogger);
    this.state.positionAnimation.setOffset(this.state.positionAnimation._value);
    this.state.positionAnimation.setValue(0);
  };

  onPanResponderMove = (evt, gestureState) => {
    this.state.positionAnimation.setValue(this.adjustMovementBySide(gestureState.dx));
  };

  onPanResponderRelease = (evt, gestureState) => {
    let logger = loggerCreator("onPanResponderRelease", moduleLogger);

    this.state.positionAnimation.flattenOffset();

    let toOpen = null;
    if (Math.abs(gestureState.vx) > MIN_SPEED_TO_TOGGLE_SIDEBAR) {
      toOpen = this.adjustMovementBySide(gestureState.vx) > MIN_SPEED_TO_TOGGLE_SIDEBAR;
    } else {
      toOpen = !this.props.isOpen;
    }

    if (this.props.isOpen !== toOpen) {
      this.props.onChangeOpen(toOpen);
    } else {
      this.slideSidebar(toOpen);
    }
  };

  slideSidebar(isOpen) {
    Animated.timing(this.state.positionAnimation, {
      toValue: this.targetAnimatedPosition(isOpen),
      duration: 200,
    }).start();
  }

  render() {
    const targetSide = this.props.fromLeft ? "left" : "right";
    const targetRoundedCorner = this.props.fromLeft ? "borderTopRightRadius" : "borderTopLeftRadius";

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
        <View style={styles.scrub} />
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
        <View style={styles.scrub} />
      </Animated.View>
    );
  }
}

Sidebar.propTypes = {
  width: React.PropTypes.number.isRequired,
  fromLeft: React.PropTypes.bool.isRequired,

  isOpen: React.PropTypes.bool.isRequired,
  onChangeOpen: React.PropTypes.func.isRequired,
};
