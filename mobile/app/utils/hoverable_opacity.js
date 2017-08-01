import React, { Component } from "react";
import { TouchableOpacity } from "react-native";

export default class HoverableOpacity extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { style, hoverStyle, ...otherProps } = this.props;

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[{ cursor: "pointer" }, style, this.state.hover ? hoverStyle : {}]}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        {...otherProps}>
        {this.props.children}
      </TouchableOpacity>
    );
  }
}

HoverableOpacity.propTypes = {
  hoverStyle: React.PropTypes.shape({}),
  style: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.array]),
};
