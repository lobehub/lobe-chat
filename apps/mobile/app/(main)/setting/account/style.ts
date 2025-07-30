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
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: 10,
    marginTop: 8,
    padding: 16,
  },
  signOutButtonText: {
    color: token.colorError,
    fontSize: 17,
    fontWeight: 'normal',
  },
}));
