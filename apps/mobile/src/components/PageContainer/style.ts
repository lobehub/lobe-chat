import { HEADER_HEIGHT } from '@/_const/common';
import { createStyles } from '@/components/styles';

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
  largeTitle: {
    paddingBottom: token.paddingSM,
    paddingHorizontal: 16,
    paddingTop: token.paddingSM,
  },
  largeTitleText: {
    color: token.colorTextHeading,
    fontSize: 34,
    fontWeight: '700',
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    minHeight: '100%',
    paddingBottom: token.paddingLG,
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
