import loggerCreator from "app/utils/logger";
//noinspection JSUnresolvedVariable
var moduleLogger = loggerCreator("Sidebar");

import React, { Component } from "react";
import { Image, StyleSheet, Text, View, Animated, PanResponder } from "react-native";
import { observer } from "mobx-react";
import { colors } from "app/styles/styles";

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    backgroundColor: colors.CONTAINER_BACKGROUND_NORMAL,
    top: 54,
    bottom: -1,
    borderColor: colors.CYAN_BRIGHT,
    borderStyle: "solid",
    borderWidth: 1,
  },
});

@observer
export default class Sidebar extends Component {
  componentWillMount() {
    this.openPosition = -2;
    this.closePosition = this.openPosition - this.props.width;
    this.state = { positionAnimation: new Animated.Value(this.props.isOpen ? this.openPosition : this.closePosition) };

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }

  componentWillReceiveProps(nextProps) {
    loggerCreator("componentWillReceiveProps", moduleLogger);

    Animated.timing(this.state.positionAnimation, {
      toValue: nextProps.isOpen ? this.openPosition : this.closePosition,
      duration: 200,
    }).start();
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
    this.state.positionAnimation.setValue(gestureState.dx);
  };

  onPanResponderRelease = (evt, gestureState) => {
    loggerCreator("onPanResponderRelease", moduleLogger);

    this.state.positionAnimation.flattenOffset();
    this.props.onChangeOpen(gestureState.vx > 0);
  };

  render() {
    const targetSide = this.props.fromLeft ? "left" : "right";
    const targetRoundedCorner = this.props.fromLeft ? "borderTopRightRadius" : "borderTopLeftRadius";

    return (
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: this.props.width,
            [targetRoundedCorner]: 5,
            [targetSide]: this.state.positionAnimation.interpolate({
              inputRange: [this.closePosition, this.openPosition],
              outputRange: [this.closePosition, this.openPosition],
              extrapolate: "clamp",
            }),
          },
        ]}
        {...this.panResponder.panHandlers}>
        {this.props.children}
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
