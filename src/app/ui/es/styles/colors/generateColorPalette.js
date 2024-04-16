import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { capitalize } from 'lodash-es';
export var generateColorPalette = function generateColorPalette(_ref) {
  var type = _ref.type,
    scale = _ref.scale,
    appearance = _ref.appearance;
  var name = capitalize(type);
  var isDarkMode = appearance === 'dark';
  return _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, "color".concat(name, "Bg"), scale[appearance][1]), "color".concat(name, "BgHover"), scale[appearance][2]), "color".concat(name, "Border"), scale[appearance][4]), "color".concat(name, "BorderHover"), scale[appearance][isDarkMode ? 5 : 3]), "color".concat(name, "Hover"), scale[appearance][isDarkMode ? 10 : 8]), "color".concat(name), scale[appearance][9]), "color".concat(name, "Active"), scale[appearance][isDarkMode ? 7 : 10]), "color".concat(name, "TextHover"), scale[appearance][isDarkMode ? 10 : 8]), "color".concat(name, "Text"), scale[appearance][9]), "color".concat(name, "TextActive"), scale[appearance][isDarkMode ? 7 : 10]);
};
export var generateColorNeutralPalette = function generateColorNeutralPalette(_ref3) {
  var scale = _ref3.scale,
    appearance = _ref3.appearance;
  return {
    colorBgContainer: appearance === 'dark' ? scale[appearance][1] : scale[appearance][0],
    colorBgElevated: appearance === 'dark' ? scale[appearance][2] : scale[appearance][0],
    colorBgLayout: appearance === 'dark' ? scale[appearance][0] : scale[appearance][1],
    colorBgMask: scale.lightA[8],
    colorBgSpotlight: scale[appearance][5],
    colorBorder: scale[appearance][4],
    colorBorderSecondary: scale[appearance][3],
    colorFill: scale["".concat(appearance, "A")][3],
    colorFillQuaternary: scale["".concat(appearance, "A")][0],
    colorFillSecondary: scale["".concat(appearance, "A")][2],
    colorFillTertiary: scale["".concat(appearance, "A")][1],
    colorText: scale[appearance][12],
    colorTextQuaternary: scale[appearance][6],
    colorTextSecondary: scale[appearance][10],
    colorTextTertiary: scale[appearance][8]
  };
};