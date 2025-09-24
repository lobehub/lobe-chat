import { HEADER_HEIGHT } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  extra: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingXS,
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    textAlign: 'center',
  },
}));
