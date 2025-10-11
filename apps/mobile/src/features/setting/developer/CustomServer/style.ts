import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  actionSection: {
    gap: token.marginSM,
  },
  container: {
    gap: token.marginLG,
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
  infoCard: {
    backgroundColor: token.colorInfoBg,
    borderColor: token.colorInfoBorder,
    borderRadius: token.borderRadiusLG,
    borderWidth: 1,
    marginBottom: token.marginLG,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.padding,
  },
  infoDescription: {
    color: token.colorInfoText,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    marginTop: token.marginXXS,
  },

  infoTitle: {
    color: token.colorInfo,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
}));
