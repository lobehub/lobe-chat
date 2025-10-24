import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  actionSheetContainer: {
    backgroundColor: token.colorBgElevated,
  },
  actionSheetText: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
  actionSheetTitle: {
    color: token.colorTextHeading,
    fontSize: token.fontSizeLG,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 32,
    justifyContent: 'center',
    width: '100%',
  },
  selectButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 70,
    paddingBlock: token.paddingXXS,
    paddingInline: 0,
  },
  selectText: {
    color: token.colorText,
    fontSize: token.fontSizeSM,
    fontWeight: '600',
  },
}));
