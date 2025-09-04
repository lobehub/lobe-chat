import { createStyles } from '@/theme';
import { Platform } from 'react-native';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    paddingTop: token.paddingSM,
  },
  header: {
    paddingVertical: token.marginSM,
  },
  headerText: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
  },
  searchInput: {
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
  sessionList: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.marginXS,
  },
}));
