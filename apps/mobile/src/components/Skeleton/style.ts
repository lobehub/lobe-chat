import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  paragraphContainer: {
    flexDirection: 'column',
  },
  skeletonItem: {
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusLG,
  },
  textContainer: {
    flex: 1,
  },
}));
