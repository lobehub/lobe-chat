import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: token.paddingContentHorizontal,
    paddingVertical: token.paddingContentVerticalSM,
  },

  leftSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXS,
    minWidth: 0, // 允许文字收缩
  },

  modelName: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },

  rightSection: {
    flexShrink: 0,
    marginLeft: token.marginXS,
  },
}));
