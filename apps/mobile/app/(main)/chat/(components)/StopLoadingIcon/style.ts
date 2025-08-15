import { createStyles } from '@/components/ThemeProvider/createStyles';

export const useStyles = createStyles((_, size: number) => ({
  container: {
    height: size,
    position: 'relative',
    width: size,
  },
  rotatingContainer: {
    height: size,
    position: 'absolute',
    width: size,
  },
  staticContainer: {
    height: size,
    position: 'absolute',
    width: size,
  },
}));
