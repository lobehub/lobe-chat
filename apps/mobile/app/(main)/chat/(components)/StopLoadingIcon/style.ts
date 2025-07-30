import { createStyles } from '@/mobile/theme/createStyles';

export const useStyles = createStyles((_, size: number) => ({
  rotatingContainer: {
    height: size,
    position: 'absolute',
    width: size,
  },
}));
