import { createStyles } from '@/theme';
import { Platform } from 'react-native';

interface UseStylesProps {
  multiline?: boolean;
}

export const useStyles = createStyles((token, { multiline = false }: UseStylesProps) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
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
}));
