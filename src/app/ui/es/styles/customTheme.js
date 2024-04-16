import { colorScales } from "./colors/colors";
import { neutralColorScales } from "./colors/neutralColors";
export var primaryColors = {
  blue: colorScales.blue.dark[9],
  cyan: colorScales.cyan.dark[9],
  geekblue: colorScales.geekblue.dark[9],
  gold: colorScales.gold.dark[9],
  green: colorScales.green.dark[9],
  lime: colorScales.lime.dark[9],
  magenta: colorScales.magenta.dark[9],
  orange: colorScales.orange.dark[9],
  purple: colorScales.purple.dark[9],
  red: colorScales.red.dark[9],
  volcano: colorScales.volcano.dark[9],
  yellow: colorScales.yellow.dark[9]
};
export var primaryColorsSwatches = [primaryColors.red, primaryColors.orange, primaryColors.gold, primaryColors.yellow, primaryColors.lime, primaryColors.green, primaryColors.cyan, primaryColors.blue, primaryColors.geekblue, primaryColors.purple, primaryColors.magenta, primaryColors.volcano];
export var neutralColors = {
  mauve: neutralColorScales.mauve.dark[9],
  olive: neutralColorScales.olive.dark[9],
  sage: neutralColorScales.sage.dark[9],
  sand: neutralColorScales.sand.dark[9],
  slate: neutralColorScales.slate.dark[9]
};
export var neutralColorsSwatches = [neutralColors.mauve, neutralColors.slate, neutralColors.sage, neutralColors.olive, neutralColors.sand];
export var findCustomThemeName = function findCustomThemeName(type, value) {
  var res = type === 'primary' ? primaryColors : neutralColors;
  var result = Object.entries(res).find(function (item) {
    return item[1] === value;
  });
  return result === null || result === void 0 ? void 0 : result[0];
};