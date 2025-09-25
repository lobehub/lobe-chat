import { CHAT_INPUT_HEIGHT } from '@/_const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG * 2,
    borderWidth: 0.5,
    height: 'auto',
    marginHorizontal: token.paddingXS,
    minHeight: CHAT_INPUT_HEIGHT,
    // ...token.boxShadowCard,
  },
  extraBtn: {
    flexShrink: 0,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: token.paddingXS,
    paddingHorizontal: token.paddingSM,
    width: '100%',
  },
  iconGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },
  input: {
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },

  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },
}));
