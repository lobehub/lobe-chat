import { createStyles } from '@/theme';
import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/const/common';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    padding: token.paddingContentHorizontal,
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
}));
