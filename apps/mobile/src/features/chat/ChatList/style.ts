import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  chatContainer: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  scrollToBottomBtn: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusLG,
    bottom: 88,
    left: '50%',
    padding: token.paddingSM,
    position: 'absolute',
    ...token.boxShadow,
    transform: [{ translateX: -28 }],
    zIndex: 10,
  },
}));
