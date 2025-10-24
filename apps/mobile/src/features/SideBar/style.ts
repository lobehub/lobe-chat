import { darken, rgba } from 'polished';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  container: {
    flex: 1,
  },
  drawerBackground: {
    backgroundColor: isDarkMode ? token.colorBgContainerSecondary : token.colorBgLayout,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode ? token.colorBgMask : rgba(darken(0.1, token.colorBgLayout), 0.5),
  },
  drawerStyle: {
    width: DRAWER_WIDTH,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: token.controlHeightLG,
    justifyContent: 'space-between',
    paddingInline: token.padding,
  },
  headerTitle: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeHeading4,
    fontWeight: token.fontWeightStrong,
    padding: token.paddingXXS,
  },
  settingButton: {
    padding: token.paddingXS,
  },
}));
