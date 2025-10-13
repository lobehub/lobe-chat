import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  footer: {
    alignItems: 'center',
    // glass effect
    backdropFilter: 'saturate(150%) blur(10px)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
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
