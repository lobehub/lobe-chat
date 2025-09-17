import { ViewStyle } from 'react-native';
import type { AliasToken } from '@/theme';

export type ActionIconSizeConfig = {
  blockSize?: number | string;
  borderRadius?: number | string;
  size?: number;
};

export type ActionIconSize = number | 'small' | 'middle' | 'large' | ActionIconSizeConfig;

export const calcSize = (iconSize?: ActionIconSize) => {
  let blockSize: number;
  let borderRadius: number;
  let innerIconSize: number | undefined;

  if (typeof iconSize === 'number') {
    blockSize = Math.round(iconSize * 1.8);
    borderRadius = Math.floor(blockSize / 6);
    innerIconSize = iconSize;
  } else if (typeof iconSize === 'object' && iconSize !== null) {
    blockSize = (iconSize.blockSize as number) || 36;
    borderRadius = (iconSize.borderRadius as number) || 6;
    innerIconSize = iconSize.size;
  } else {
    switch (iconSize) {
      case 'large': {
        blockSize = 44;
        borderRadius = 8;
        innerIconSize = 24;
        break;
      }
      case 'small': {
        blockSize = 24;
        borderRadius = 4;
        innerIconSize = 16;
        break;
      }
      default: {
        blockSize = 36;
        borderRadius = 6;
        innerIconSize = 20;
        break;
      }
    }
  }

  return { blockSize, borderRadius, innerIconSize };
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
