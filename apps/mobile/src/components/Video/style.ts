import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    backgroundColor: token.colorFill,
    borderRadius: token.borderRadiusLG * 1.5,
  },
}));
