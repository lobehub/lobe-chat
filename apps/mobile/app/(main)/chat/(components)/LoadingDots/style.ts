import { createStyles } from '@/components/ThemeProvider/createStyles';

export const useStyles = createStyles((token, size: number, dotColor: string) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: token.paddingXS,
  },
  dot: {
    backgroundColor: dotColor,
    borderRadius: size / 2,
    height: size,
    marginHorizontal: 2,
    width: size,
  },
}));
