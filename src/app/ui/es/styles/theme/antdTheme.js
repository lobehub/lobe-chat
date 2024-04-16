import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { darkAlgorithm } from "./algorithms/darkAlgorithm";
import { lightAlgorithm } from "./algorithms/lightAlgorithm";
import { baseToken } from "./token/base";
/**
 * create A LobeHub Style Antd Theme Object
 * @param neutralColor
 * @param appearance
 * @param primaryColor
 */
export var createLobeAntdTheme = function createLobeAntdTheme(_ref) {
  var neutralColor = _ref.neutralColor,
    appearance = _ref.appearance,
    primaryColor = _ref.primaryColor;
  var isDark = appearance === 'dark';
  return {
    algorithm: isDark ? darkAlgorithm : lightAlgorithm,
    token: _objectSpread(_objectSpread({}, baseToken), {}, {
      // @ts-ignore
      neutralColor: neutralColor,
      primaryColor: primaryColor
    })
  };
};