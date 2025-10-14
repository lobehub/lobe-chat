import { blue, gold, gray, lime, primary, red } from '../color';
import { generateColorNeutralPalette, generateColorPalette } from '../generateColorPalette';
import type { AliasToken } from '../interface';

const primaryToken = generateColorPalette({
  appearance: 'dark',
  scale: primary,
  type: 'Primary',
});

const neutralToken = generateColorNeutralPalette({
  appearance: 'dark',
  scale: gray,
});

const successToken = generateColorPalette({
  appearance: 'dark',
  scale: lime,
  type: 'Success',
});

const warningToken = generateColorPalette({
  appearance: 'dark',
  scale: gold,
  type: 'Warning',
});

const errorToken = generateColorPalette({
  appearance: 'dark',
  scale: red,
  type: 'Error',
});

const infoToken = generateColorPalette({
  appearance: 'dark',
  scale: blue,
  type: 'Info',
});

const darkBaseToken = {
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

  colorLink: (infoToken as any).colorInfoText,
  colorLinkActive: (infoToken as any).colorInfoTextActive,
  colorLinkHover: (infoToken as any).colorInfoTextHover,
  colorTextLightSolid: neutralToken.colorBgLayout,
} as Partial<AliasToken>;

export default darkBaseToken;
