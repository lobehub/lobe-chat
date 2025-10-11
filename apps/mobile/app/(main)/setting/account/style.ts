import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  avatarSection: {
    alignItems: 'center',
    marginBottom: token.marginLG,
    paddingVertical: token.paddingXL,
  },
  container: {
    paddingHorizontal: token.padding,
  },
  signOutSection: {
    marginTop: token.marginXS,
  },
}));
