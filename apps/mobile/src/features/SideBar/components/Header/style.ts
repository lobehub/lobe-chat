import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  extra: {
    display: 'flex',
    flexDirection: 'row',
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
  },
  settingButton: {
    padding: token.paddingXS,
  },
}));
