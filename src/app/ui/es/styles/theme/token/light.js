import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { colorScales } from "../../colors/colors";
import { generateColorNeutralPalette, generateColorPalette } from "../../colors/generateColorPalette";
var primaryToken = generateColorPalette({
  appearance: 'light',
  scale: colorScales.bnw,
  type: 'Primary'
});
var neutralToken = generateColorNeutralPalette({
  appearance: 'light',
  scale: colorScales.gray
});
var successToken = generateColorPalette({
  appearance: 'light',
  scale: colorScales.green,
  type: 'Success'
});
var warningToken = generateColorPalette({
  appearance: 'light',
  scale: colorScales.orange,
  type: 'Warning'
});
var errorToken = generateColorPalette({
  appearance: 'light',
  scale: colorScales.volcano,
  type: 'Error'
});
var infoToken = generateColorPalette({
  appearance: 'light',
  scale: colorScales.geekblue,
  type: 'Info'
});
var lightBaseToken = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, primaryToken), neutralToken), successToken), warningToken), errorToken), infoToken), {}, {
  boxShadow: '0 20px 20px -8px rgba(0, 0, 0, 0.24)',
  boxShadowSecondary: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
  boxShadowTertiary: '0 3px 1px -1px rgba(26, 26, 26, 0.06)',
  colorLink: infoToken.colorInfoText,
  colorLinkActive: infoToken.colorInfoTextActive,
  colorLinkHover: infoToken.colorInfoTextHover,
  colorTextLightSolid: neutralToken.colorBgLayout
});
export default lightBaseToken;