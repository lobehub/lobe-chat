import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
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
    paddingInline: 16,
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
    zIndex: 1,
  },
}));
