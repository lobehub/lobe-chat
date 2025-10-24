import type { ButtonSize } from './type';

export interface ButtonSizeConfig {
  borderRadius: number;
  fontSize: number;
  height: number;
  paddingBlock: number;
  paddingInline: number;
}

/**
 * Calculate button size configuration
 * Similar to ActionIcon's calcSize for consistency
 */
export const calcSize = (size?: ButtonSize, token?: any): ButtonSizeConfig => {
  switch (size) {
    case 'small': {
      const height = token?.controlHeightSM || 32;
      return {
        borderRadius: height / 2,
        fontSize: 14,
        height,
        paddingBlock: 0,
        paddingInline: (token?.paddingXS || 8) * 1.25,
      };
    }
    case 'large': {
      const height = token?.controlHeightLG || 44;
      return {
        borderRadius: height / 2,
        fontSize: 18,
        height,
        paddingBlock: token?.paddingXS || 8,
        paddingInline: (token?.paddingSM || 12) * 1.25,
      };
    }
    default: {
      // middle
      const height = token?.controlHeight || 38;
      return {
        borderRadius: height / 2,
        fontSize: 16,
        height,
        paddingBlock: token?.paddingXXS || 4,
        paddingInline: (token?.paddingSM || 12) * 1.25,
      };
    }
  }
};
