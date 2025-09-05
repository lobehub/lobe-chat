import { createStyles } from '@/theme';
import { Platform } from 'react-native';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    height: token.controlHeightLG,
    marginHorizontal: token.padding,
    marginVertical: token.marginXS,
    paddingHorizontal: token.paddingSM,
  },
  input: {
    color: token.colorText,
    flex: 1,
    fontFamily: token.fontFamily,
    fontSize: token.fontSizeLG,
    lineHeight: undefined,
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      // 垂直居中
      paddingTop: token.paddingXXS,
      paddingVertical: 0,
      // 移除额外的字体内边距
      textAlignVertical: 'center',
    }),
  },
  prefixContainer: {
    marginRight: token.marginXS,
  },
}));
