import { Platform } from 'react-native';

import type { AliasToken } from '../interface';

const FONT_EN = Platform.select({
  android: 'HarmonyOS-Sans',
  default: 'HarmonyOS-Sans',
  ios: 'HarmonyOS Sans',
}) as string;
const FONT_CN = Platform.select({
  android: 'HarmonyOS-Sans-SC',
  default: 'HarmonyOS-Sans-SC',
  ios: 'HarmonyOS Sans SC',
}) as string;
const FONT_CODE = Platform.select({
  android: 'Hack',
  default: 'Hack',
  ios: 'Hack',
}) as string;

export const baseToken: Partial<AliasToken> = {
  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusSM: 4,
  borderRadiusXS: 4,
  controlHeight: 36,
  fontFamily: [FONT_EN, FONT_CN].join(','),
  fontFamilyCode: [FONT_CODE, FONT_CN].join(','),
};
