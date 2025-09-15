import { createStyles } from '@/theme';
import { CHAT_INPUT_HEIGHT } from '@/const/common';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius * 4,
    borderWidth: 0.5,
    height: 'auto',
    marginHorizontal: token.marginXXS,
    minHeight: CHAT_INPUT_HEIGHT,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
    // ...token.boxShadowCard,
  },
  extraBtn: {
    flexShrink: 0,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: token.marginXS,
    width: '100%',
  },
  iconGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    flex: 1,
  },
  inputArea: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
