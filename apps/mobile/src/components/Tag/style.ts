import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  tag: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusXS,
    marginBottom: token.marginXXS,
    marginLeft: token.marginXXS,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
  },
  tagText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
  },
}));
