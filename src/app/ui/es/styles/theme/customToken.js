import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _createForOfIteratorHelper from "@babel/runtime/helpers/esm/createForOfIteratorHelper";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { camelCase } from 'lodash-es';
import { colorScales } from "../colors/colors";
var generateColorPalette = function generateColorPalette(_ref) {
  var _ref2;
  var name = _ref.name,
    scale = _ref.scale,
    appearance = _ref.appearance;
  return _ref2 = {}, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_ref2, "".concat(name, "Bg"), scale["".concat(appearance, "A")][1]), "".concat(name, "BgHover"), scale["".concat(appearance, "A")][2]), "".concat(name, "Border"), scale[appearance][4]), "".concat(name, "BorderSecondary"), scale[appearance][3]), "".concat(name, "BorderHover"), scale[appearance][5]), "".concat(name, "Hover"), scale[appearance][10]), "".concat(name), scale[appearance][9]), "".concat(name, "Active"), scale[appearance][7]), "".concat(name, "TextHover"), scale["".concat(appearance, "A")][10]), "".concat(name, "Text"), scale["".concat(appearance, "A")][9]), _defineProperty(_ref2, "".concat(name, "TextActive"), scale["".concat(appearance, "A")][7]);
};
var generateCustomColorPalette = function generateCustomColorPalette(_ref3) {
  var name = _ref3.name,
    scale = _ref3.scale,
    appearance = _ref3.appearance;
  var colorStepPalette = {};
  var _iterator = _createForOfIteratorHelper(scale[appearance].entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        index = _step$value[0],
        color = _step$value[1];
      if (index === 0 || index === 12) continue;
      colorStepPalette["".concat(name).concat(index)] = color;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _iterator2 = _createForOfIteratorHelper(scale["".concat(appearance, "A")].entries()),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _step2$value = _slicedToArray(_step2.value, 2),
        _index = _step2$value[0],
        _color = _step2$value[1];
      if (_index === 0 || _index === 12) continue;
      colorStepPalette["".concat(name).concat(_index, "A")] = _color;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return _objectSpread(_objectSpread({}, colorStepPalette), generateColorPalette({
    appearance: appearance,
    name: name,
    scale: scale
  }));
};
export var generateCustomToken = function generateCustomToken(_ref4) {
  var isDarkMode = _ref4.isDarkMode;
  var colorCustomToken = {};
  for (var _i = 0, _Object$entries = Object.entries(colorScales); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      type = _Object$entries$_i[0],
      scale = _Object$entries$_i[1];
    colorCustomToken = _objectSpread(_objectSpread({}, colorCustomToken), generateCustomColorPalette({
      appearance: isDarkMode ? 'dark' : 'light',
      name: camelCase(type),
      scale: scale
    }));
  }
  return colorCustomToken;
};