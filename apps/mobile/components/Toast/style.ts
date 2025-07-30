import { createStyles } from '@/mobile/theme';

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
    fontWeight: '500',
    lineHeight: token.lineHeight * token.fontSize,
  },
  toast: {
    alignItems: 'center',
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    elevation: 8,
    flexDirection: 'row',
    gap: token.marginXS,
    paddingHorizontal: token.paddingContentHorizontal,
    paddingVertical: token.paddingContentVertical,
    shadowColor: token.colorBgMask,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
}));
