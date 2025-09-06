import { createStyles } from '@/theme';
import { Platform } from 'react-native';

interface UseStylesProps {
  multiline?: boolean;
  variant?: 'filled' | 'borderless';
}

export const useStyles = createStyles(
  (token, { multiline = false, variant = 'filled' }: UseStylesProps) => ({
    container: {
      alignItems: 'center',
      backgroundColor: variant === 'filled' ? token.colorFillTertiary : 'transparent',
      borderRadius: variant === 'filled' ? token.borderRadius : 0,
      display: 'flex',
      flexDirection: 'row',
      paddingHorizontal: variant === 'filled' ? token.paddingSM : 0,
      paddingVertical: variant === 'filled' ? token.paddingXS : 0,
    },
    input: {
      color: token.colorText,
      flex: 1,
      fontFamily: token.fontFamily,
      fontSize: token.fontSizeLG,
      height: multiline ? undefined : token.controlHeight,
      lineHeight: multiline ? token.lineHeightLG : undefined,
      textAlignVertical: multiline ? 'top' : 'center',
      ...(Platform.OS === 'android' && {
        includeFontPadding: false,
        // 垂直居中
        paddingTop: token.paddingXXS,
        paddingVertical: 0,
      }),
    },
    prefixContainer: {
      marginRight: token.marginXS,
    },
    suffixContainer: {
      marginLeft: token.marginXS,
    },
  }),
);
