import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  root: {
    flex: 1,
  },
  title: {
    color: token.colorText,
    flexShrink: 1,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    maxWidth: '100%',
    textAlign: 'left',
  },
}));
