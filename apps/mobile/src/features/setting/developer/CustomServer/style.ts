import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  actionSection: {
    gap: token.marginXS,
    marginTop: token.marginSM,
  },
  container: {
    padding: token.paddingContentHorizontal,
  },
  customServerCurrentValue: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600',
    marginBottom: token.marginSM,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginLG,
  },
  formCard: {
    padding: token.paddingMD,
    width: '100%',
  },
  formLabel: {
    color: token.colorTextDescription,
    fontSize: token.fontSizeSM,
    marginBottom: token.marginXXS,
  },
  safeAreaView: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
}));
