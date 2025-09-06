import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: token.borderRadiusXS,
    justifyContent: 'center',
    minHeight: token.controlInteractiveSize,
    minWidth: token.controlInteractiveSize,
    padding: token.paddingXXS,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
    justifyContent: 'flex-start',
    paddingHorizontal: token.paddingContentHorizontalSM,
  },
}));
