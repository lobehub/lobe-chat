import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  scrollToBottomBtn: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG * 3,
    padding: token.paddingXS,
    ...token.boxShadowCard,
  },
  scrollToBottomWrapper: {
    alignItems: 'center',
    bottom: 8,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
}));
