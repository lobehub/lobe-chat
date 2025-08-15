const PresetColors = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
  'gray',
] as const;

const PresetSystemColors = ['Error', 'Warning', 'Success', 'Info'] as const;

export type PresetColorKey = (typeof PresetColors)[number];

export type PresetSystemColorKey = (typeof PresetSystemColors)[number];

export type PresetColorType = Record<PresetColorKey, string>;

export type PresetSystemColorType = Record<PresetSystemColorKey, string>;

type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type ColorTokenKey =
  | 'Fill'
  | 'FillSecondary'
  | 'FillTertiary'
  | 'FillQuaternary'
  | 'Bg'
  | 'BgHover'
  | 'Border'
  | 'BorderSecondary'
  | 'BorderHover'
  | 'Hover'
  | ''
  | 'Active'
  | 'TextHover'
  | 'Text'
  | 'TextActive';

type SystemColorTokenKey = 'Fill' | 'FillSecondary' | 'FillTertiary' | 'FillQuaternary';

export type ColorToken = {
  [key in `${keyof PresetColorType}${ColorTokenKey}`]: string;
};

export type SystemColorToken = {
  [key in `color${keyof PresetSystemColorType}${SystemColorTokenKey}`]: string;
};

export type ColorPalettes = {
  [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}`]: string;
};

export type ColorPalettesAlpha = {
  [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}A`]: string;
};

export interface LobeCustomToken
  extends ColorPalettes,
    ColorPalettesAlpha,
    ColorToken,
    SystemColorToken {
  colorBgContainerSecondary: string;
}
