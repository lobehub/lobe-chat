import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { generateColorNeutralPalette, generateColorPalette, neutralColorScales } from "../..";
import { colorScales } from "../../colors/colors";
import lightBaseToken from "../token/light";
export var lightAlgorithm = function lightAlgorithm(seedToken, mapToken) {
  var primaryColor = seedToken.primaryColor;
  var neutralColor = seedToken.neutralColor;
  var primaryTokens = {};
  var neutralTokens = {};
  var primaryScale = colorScales[primaryColor];
  if (primaryScale) {
    primaryTokens = generateColorPalette({
      appearance: 'light',
      scale: primaryScale,
      type: 'Primary'
    });
  }
  var neutralScale = neutralColorScales[neutralColor];
  if (neutralScale) {
    neutralTokens = generateColorNeutralPalette({
      appearance: 'light',
      scale: neutralScale
    });
  }
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, mapToken), lightBaseToken), primaryTokens), neutralTokens);
};