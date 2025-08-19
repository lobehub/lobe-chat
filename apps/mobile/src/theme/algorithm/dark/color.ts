import type { AliasToken } from '../../interface';
import { generateColorPalette, generateColorNeutralPalette } from '../shared/generateColorPalette';
import { colorScales } from '../../color/primary';
import { neutralColorScales } from '../../color/neutrals';

// 使用默认颜色生成暗色主题Token
const primaryToken = generateColorPalette({
  appearance: 'dark',
  scale: colorScales.primary,
  type: 'Primary',
});

const neutralToken = generateColorNeutralPalette({
  appearance: 'dark',
  scale: neutralColorScales.slate,
});

const successToken = generateColorPalette({
  appearance: 'dark',
  scale: colorScales.lime,
  type: 'Success',
});

const warningToken = generateColorPalette({
  appearance: 'dark',
  scale: colorScales.gold,
  type: 'Warning',
});

const errorToken = generateColorPalette({
  appearance: 'dark',
  scale: colorScales.red,
  type: 'Error',
});

const infoToken = generateColorPalette({
  appearance: 'dark',
  scale: colorScales.blue,
  type: 'Info',
});

const darkBaseToken: Partial<AliasToken> = {
  ...primaryToken,
  ...neutralToken,
  ...successToken,
  ...warningToken,
  ...errorToken,
  ...infoToken,

  boxShadow: {
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.24)',
    shadowOffset: { height: 20, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },

  boxShadowSecondary: {
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },

  boxShadowTertiary: {
    elevation: 1,
    shadowColor: 'rgba(26, 26, 26, 0.06)',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 1,
    shadowRadius: 1,
  },

  // 链接颜色
  colorLink: infoToken.colorInfoText,

  colorLinkActive: infoToken.colorInfoTextActive,

  colorLinkHover: infoToken.colorInfoTextHover,
  // 暗色模式专用颜色
  colorTextLightSolid: neutralToken.colorBgLayout,
};

export default darkBaseToken;
