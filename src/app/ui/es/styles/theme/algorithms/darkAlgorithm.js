import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { generateColorNeutralPalette, generateColorPalette, neutralColorScales } from "../..";
import { colorScales } from "../../colors/colors";
import darkBaseToken from "../token/dark";
export var darkAlgorithm = function darkAlgorithm(seedToken, mapToken) {
  var primaryColor = seedToken.primaryColor;
  var neutralColor = seedToken.neutralColor;
  var primaryTokens = {};
  var neutralTokens = {};

  // generate primary color Token with colorPrimary
  var primaryScale = colorScales[primaryColor];
  if (primaryScale) {
    primaryTokens = generateColorPalette({
      appearance: 'dark',
      scale: primaryScale,
      type: 'Primary'
    });
  }

  // generate neutral color Token with colorBgBase
  var neutralScale = neutralColorScales[neutralColor];
  if (neutralScale) {
    neutralTokens = generateColorNeutralPalette({
      appearance: 'dark',
      scale: neutralScale
    });
  }
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, mapToken), darkBaseToken), primaryTokens), neutralTokens);
};