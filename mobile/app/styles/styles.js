import Color from "color";

const _rawColor = {
  CYAN_DARKEST: Color("#111f22"),
  CYAN_DARK: Color("#335d66"),
  CYAN_BRIGHT: Color("#71cfe2"),
  SEMI_WHITE: Color("#e2e2e2"),
  RED: Color("#e25d24"),
};

const colors = {
  CYAN_DARKEST: _rawColor.CYAN_DARKEST.rgbString(),

  CYAN_DARK: _rawColor.CYAN_DARK.rgbString(),
  CYAN_DARK_CLEARER: _rawColor.CYAN_DARK.clone().clearer(0.5).rgbString(),
  CYAN_DARK_CLEAR: _rawColor.CYAN_DARK.clone().clearer(0.2).rgbString(),

  CYAN_BRIGHT: _rawColor.CYAN_BRIGHT.rgbString(),
  SEMI_WHITE: _rawColor.SEMI_WHITE.rgbString(),
  RED: _rawColor.RED.rgbString(),
};

const fontSizes = {
  NORMAL: 15,
  LARGE: 20,
};

export { colors, fontSizes };
