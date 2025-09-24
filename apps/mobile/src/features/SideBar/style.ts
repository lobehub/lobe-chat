import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    flex: 1,
  },
  drawerOverlay: {
    backgroundColor: token.colorBgMask,
  },
  drawerStyle: {
    backgroundColor: token.colorBgLayout,
    width: '80%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: token.controlHeightLG,
    justifyContent: 'space-between',
    paddingHorizontal: token.padding,
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
