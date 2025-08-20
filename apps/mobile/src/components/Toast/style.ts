import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  closeButton: {
    borderRadius: token.borderRadiusXS,
    marginLeft: token.marginXS,
    padding: token.paddingXXS,
  },
  message: {
    color: token.colorText,
    flex: 1,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    lineHeight: token.lineHeight,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    flexDirection: 'row',
    gap: token.marginXS,
    paddingHorizontal: token.paddingContentHorizontal,
    paddingVertical: token.paddingContentVertical,
    width: '100%',
    ...token.boxShadow,
  },
  touchable: {
    width: '100%',
  },
}));
