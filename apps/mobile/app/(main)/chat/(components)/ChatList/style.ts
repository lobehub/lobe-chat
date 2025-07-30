import { createStyles } from '@/theme/createStyles';

export const useStyles = createStyles((token) => ({
  chatContainer: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.padding,
  },
  scrollToBottomBtn: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusLG,
    bottom: 88,
    elevation: 8,
    left: '50%',
    padding: token.paddingSM,
    position: 'absolute',
    shadowColor: token.colorText,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    transform: [{ translateX: -28 }],
    zIndex: 10,
  },
}));
