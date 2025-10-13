import { HEADER_HEIGHT } from '@/_const/common';
import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  extra: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingXS,
    position: 'relative',
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  titleText: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    textAlign: 'center',
  },
}));
