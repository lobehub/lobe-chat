import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  headerTitle: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
