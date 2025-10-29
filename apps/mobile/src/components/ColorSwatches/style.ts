import { StyleSheet } from 'react-native';

import { createStyles } from '@/components/styles';

export const useStyles = createStyles(
  (
    { token },
    {
      size,
      shape,
    }: {
      shape: 'circle' | 'square';
      size: number;
    },
  ) => {
    return {
      activeSwatch: {
        borderColor: token.colorFill,
        borderWidth: 1,
      },
      colorSwatch: {
        alignItems: 'center' as const,
        borderColor: token.colorFill,
        borderRadius: shape === 'circle' ? size / 2 : token.borderRadius,
        borderWidth: StyleSheet.hairlineWidth,
        height: size,
        justifyContent: 'center' as const,
        width: size,
      },
    };
  },
);
