import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }, size: number, dotColor: string) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBlock: token.paddingXS,
  },
  dot: {
    backgroundColor: dotColor,
    borderRadius: size / 2,
    height: size,
    marginHorizontal: 2,
    width: size,
  },
}));
