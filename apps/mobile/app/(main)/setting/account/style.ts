import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  avatarSection: {
    alignItems: 'center',
    marginBottom: token.marginLG,
    paddingVertical: token.paddingXL,
  },
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    paddingHorizontal: token.padding,
  },
  signOutSection: {
    marginTop: token.marginXS,
  },
}));
