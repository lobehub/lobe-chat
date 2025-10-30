import { darken, mix, rgba } from 'polished';
import { StyleSheet } from 'react-native';

import { DRAWER_WIDTH } from '@/_const/theme';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token, isDarkMode }) => ({
  drawerBackground: {
    backgroundColor: 'transparent',
  },
  drawerContent: {
    backgroundColor: token.colorBgContainerSecondary,
    borderBottomEndRadius: 0,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 0,
    borderBottomStartRadius: 44,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopEndRadius: 0,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 0,
    borderTopStartRadius: 44,
    borderTopWidth: 0,
  },
  drawerOverlay: {
    backgroundColor: isDarkMode
      ? 'rgba(0,0,0,.8)'
      : rgba(mix(0.5, '#000', darken(0.2, token.colorBgLayout)), 0.3),
    borderColor: token.colorFillTertiary,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  drawerStyle: {
    width: DRAWER_WIDTH,
  },
  headerTitle: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
