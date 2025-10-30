import { darken, mix, rgba } from 'polished';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  container: {
    flex: 1,
  },
  drawerBackground: {
    backgroundColor: 'transparent',
  },
  drawerContent: {
    backgroundColor: token.colorBgLayout,
    borderBottomEndRadius: 44,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 44,
    borderBottomStartRadius: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopEndRadius: 44,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 44,
    borderTopStartRadius: 0,
    borderTopWidth: 0,
    marginLeft: -1,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode
      ? 'rgba(0,0,0,.8)'
      : rgba(mix(0.5, '#000', darken(0.2, token.colorBgLayout)), 0.2),
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
