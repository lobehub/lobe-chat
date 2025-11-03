import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    position: 'relative' as const,
  },
  fallbackText: {
    color: token.colorTextSecondary,
    fontSize: 12,
    textAlign: 'center' as const,
  },
  overlayIcon: {
    position: 'absolute' as const,
  },
}));
