import { ViewStyle } from 'react-native';

import { ICON_SIZE, ICON_SIZE_LARGE, ICON_SIZE_SMALL } from '@/const/common';
import type { AliasToken } from '@/theme';

import type { IconSize, IconSizeConfig } from '../Icon';

const PRESET_ICON_SIZE = {
  large: ICON_SIZE_LARGE,
  middle: ICON_SIZE,
  small: ICON_SIZE_SMALL,
} as const;

const PRESET_BLOCK_PADDING = {
  large: 16,
  middle: 8,
  small: 4,
} as const;

const createPresetSize = (preset: keyof typeof PRESET_ICON_SIZE) => {
  const innerIconSize = PRESET_ICON_SIZE[preset];
  const blockSize = innerIconSize + PRESET_BLOCK_PADDING[preset];
  const borderRadius = Math.ceil(blockSize / 6);

  return { blockSize, borderRadius, innerIconSize };
};

export const calcSize = (iconSize?: IconSize) => {
  if (typeof iconSize === 'number') {
    const blockSize = Math.round(iconSize * 1.6);
    const borderRadius = Math.ceil(blockSize / 6);

    return { blockSize, borderRadius, innerIconSize: iconSize };
  }

  if (typeof iconSize === 'object' && iconSize !== null) {
    const config = iconSize as IconSizeConfig;
    const blockSize = (config.blockSize as number) || ICON_SIZE + PRESET_BLOCK_PADDING.middle;
    const borderRadius = (config.borderRadius as number) || Math.ceil(blockSize / 6);

    return { blockSize, borderRadius, innerIconSize: config.size };
  }

  switch (iconSize) {
    case 'large': {
      return createPresetSize('large');
    }
    case 'small': {
      return createPresetSize('small');
    }
    default: {
      return createPresetSize('middle');
    }
  }
};

export const getBaseStyle = (
  blockSize: number,
  borderRadius: number,
  disabled?: boolean,
): ViewStyle => ({
  alignItems: 'center',
  borderRadius,
  height: blockSize,
  justifyContent: 'center',
  opacity: disabled ? 0.5 : 1,
  width: blockSize,
});

export const getVariantStyle = (
  variant: 'borderless' | 'filled' | 'outlined',
  token: Pick<AliasToken, 'colorFillSecondary' | 'colorBorder'>,
): ViewStyle => {
  switch (variant) {
    case 'filled': {
      return { backgroundColor: token.colorFillSecondary };
    }
    case 'outlined': {
      return { borderColor: token.colorBorder, borderWidth: 1 };
    }
    default: {
      return { backgroundColor: 'transparent' };
    }
  }
};
