import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  footer: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    borderTopColor: token.colorBorderSecondary,
    borderTopWidth: 0.5,
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
