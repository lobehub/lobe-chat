import { createStyles } from '@/components/styles';

export const useStyles = createStyles(() => ({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  mask: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scrollView: {
    flex: 1,
  },
}));
