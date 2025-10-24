import { createStyles } from '@lobehub/ui-rn';

import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/_const/common';

export const useStyles = createStyles(({ token }) => ({
  bottomBarWrapper: {
    backgroundColor: token.colorBgContainer,
    bottom: 0,
    height: 160,
    left: 0,
    paddingBlock: token.paddingXL,
    paddingInline: token.paddingLG,
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
  fontSizeContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: token.marginLG,
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
  fontSizeText: {
    color: token.colorTextDescription,
    fontSize: token.fontSize,
  },
}));
