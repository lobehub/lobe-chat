import { createStyles } from '@/components/styles';

export const useStyles = createStyles(() => ({
  container: {
    overflow: 'hidden',
    pointerEvents: 'box-none',
    position: 'relative',
  },
  mask: {
    bottom: 0,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
}));
