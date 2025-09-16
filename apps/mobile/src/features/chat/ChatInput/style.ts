import { createStyles } from '@/theme';
import { CHAT_INPUT_HEIGHT } from '@/const/common';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius * 4,
    borderWidth: 0.5,
    height: 'auto',
    marginHorizontal: token.paddingXS,
    minHeight: CHAT_INPUT_HEIGHT,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    // ...token.boxShadowCard,
  },
  extraBtn: {
    flexShrink: 0,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
  },
  input: {
    flex: 1,
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
