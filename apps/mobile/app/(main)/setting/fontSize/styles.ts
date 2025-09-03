import { createStyles } from '@/theme';
import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/const/common';

export const useStyles = createStyles((token) => ({
  bottomBarWrapper: {
    backgroundColor: token.colorBgContainer,
    bottom: 0,
    left: 0,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingXL,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    padding: token.paddingContentHorizontal,
    width: '100%',
  },
  fontSizeLarge: {
    color: token.colorText,
    fontSize: FONT_SIZE_LARGE,
  },
  fontSizeSmall: {
    color: token.colorText,
    fontSize: FONT_SIZE_SMALL,
  },
  fontSizeStandard: {
    color: token.colorText,
    fontSize: FONT_SIZE_STANDARD,
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
