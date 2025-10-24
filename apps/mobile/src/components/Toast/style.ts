import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
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
    paddingBlock: token.paddingContentVertical,
    paddingInline: token.paddingContentHorizontal,
    width: '100%',
    ...token.boxShadow,
  },
  touchable: {
    width: '100%',
  },
}));
