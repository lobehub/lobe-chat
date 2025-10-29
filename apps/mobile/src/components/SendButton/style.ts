import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  stopButton: {
    alignItems: 'center' as const,
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderWidth: token.lineWidth,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  stopIcon: {
    position: 'absolute' as const,
  },
}));
