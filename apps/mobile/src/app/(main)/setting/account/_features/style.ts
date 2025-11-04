import { createStyles } from '@lobehub/ui-rn';

export const useStyles = createStyles(({ token }) => ({
  avatarSection: {
    alignItems: 'center',
    marginBottom: token.marginLG,
    paddingBlock: token.paddingXL,
  },
  container: {
    paddingInline: token.padding,
  },
  signOutSection: {
    marginTop: token.marginXS,
  },
}));
