import { createStyles } from '@/theme';
import { Platform } from 'react-native';

export const useStyles = createStyles((token) => ({
  input: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    color: token.colorText,
    fontSize: token.fontSizeLG,
    height: token.controlHeightLG,

    lineHeight: undefined,
    marginHorizontal: token.padding,
    marginVertical: token.marginXS,

    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      // 垂直居中
      paddingTop: token.paddingXXS,
      paddingVertical: 0,
      // 移除额外的字体内边距
      textAlignVertical: 'center',
    }),
    paddingHorizontal: token.paddingSM,
  },
}));
