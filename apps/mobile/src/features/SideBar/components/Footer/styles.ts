import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  settingsButton: {
    padding: token.paddingXXS,
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  userName: {
    color: token.colorText,
    flex: 1,
    fontWeight: token.fontWeightStrong,
    marginLeft: token.marginSM,
  },
}));
