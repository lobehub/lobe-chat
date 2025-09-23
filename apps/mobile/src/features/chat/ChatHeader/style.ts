import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  title: {
    color: token.colorText,
    flexShrink: 1,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    maxWidth: '100%',
    textAlign: 'left',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: token.marginXS,
    maxWidth: '100%',
  },
}));
