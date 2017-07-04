import React, { Component } from "react";
import { TouchableOpacity } from "react-native";

export default class HoverableOpacity extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { outerStyle, hoverStyle, ...otherProps } = this.props;

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[{ cursor: "inherit" }, outerStyle, this.state.hover ? hoverStyle : {}]}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}>
        <TouchableOpacity {...otherProps} />
      </TouchableOpacity>
    );
  }
}

HoverableOpacity.propTypes = {
  hoverStyle: React.PropTypes.shape({}),
  outerStyle: React.PropTypes.shape({}),
};
