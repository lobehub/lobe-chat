import { createStyles } from '@/components/styles';

export const useStyles = createStyles(() => ({
  scrollToBottomWrapper: {
    alignItems: 'center',
    bottom: 8,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
}));
