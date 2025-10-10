import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  actionSection: {
    gap: token.marginSM,
  },
  container: {
    padding: token.paddingContentHorizontal,
  },
  customServerCurrentValue: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginLG,
  },

  formLabel: {
    color: token.colorTextDescription,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginXXS,
  },
}));
