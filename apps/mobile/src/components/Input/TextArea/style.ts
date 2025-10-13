import { Platform } from 'react-native';

import { createStyles } from '@/components/theme';

interface UseStylesProps {
  variant?: 'filled' | 'borderless' | 'outlined';
}

export const useStyles = createStyles(({ token }, { variant = 'filled' }: UseStylesProps) => {
  return {
    container: {
      backgroundColor: variant === 'filled' ? token.colorFillTertiary : 'transparent',
      borderColor: variant === 'outlined' ? token.colorBorder : 'transparent',
      borderRadius: variant === 'borderless' ? 0 : token.borderRadius,
      borderWidth: variant === 'outlined' ? token.lineWidth : 0,
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingXXS,
    },
    input: {
      color: token.colorText,
      flex: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      minHeight: token.fontHeight,
      textAlignVertical: 'top',
      ...(Platform.OS === 'android' && {
        includeFontPadding: false,
        paddingVertical: 0,
      }),
    },
  };
});
