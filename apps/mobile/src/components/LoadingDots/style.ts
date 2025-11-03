import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }, size: number, dotColor: string) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row' as const,
    paddingVertical: token.paddingXS,
  },
  dot: {
    backgroundColor: dotColor,
    borderRadius: size / 2,
    height: size,
    marginHorizontal: 3,
    width: size,
  },
  orbitContainer: {
    alignItems: 'center',
    flexDirection: 'row' as const,
    height: size * 5,
    justifyContent: 'center',
    paddingVertical: token.paddingXS,
    position: 'relative' as const,
    width: size * 5,
  },
  orbitDot: {
    left: '50%',
    marginHorizontal: 0,
    marginLeft: -size / 2,
    position: 'absolute' as const,
    top: '50%',
  },
}));
