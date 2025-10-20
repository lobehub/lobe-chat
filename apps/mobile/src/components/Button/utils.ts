import type { ButtonSize } from './type';

export interface ButtonSizeConfig {
  borderRadius: number;
  fontSize: number;
  height: number;
  paddingHorizontal: number;
  paddingVertical: number;
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
        paddingHorizontal: (token?.paddingXS || 8) * 1.25,
        paddingVertical: 0,
      };
    }
    case 'large': {
      const height = token?.controlHeightLG || 44;
      return {
        borderRadius: height / 2,
        fontSize: 18,
        height,
        paddingHorizontal: (token?.paddingSM || 12) * 1.25,
        paddingVertical: token?.paddingXS || 8,
      };
    }
    default: {
      // middle
      const height = token?.controlHeight || 38;
      return {
        borderRadius: height / 2,
        fontSize: 16,
        height,
        paddingHorizontal: (token?.paddingSM || 12) * 1.25,
        paddingVertical: token?.paddingXXS || 4,
      };
    }
  }
};
