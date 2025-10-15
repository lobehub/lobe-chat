import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  extra: {
    zIndex: 2,
  },
  header: {
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
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  titleText: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
  },
}));
