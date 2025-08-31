import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
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
    paddingHorizontal: 0,
    paddingVertical: token.paddingXXS,
  },
  selectText: {
    color: token.colorText,
    fontSize: token.fontSizeSM,
    fontWeight: '600',
  },
}));
