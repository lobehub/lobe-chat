import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },
  content: {
    padding: token.paddingLG,
  },
  cover: {
    overflow: 'hidden',
  },
  extra: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginLeft: 'auto',
  },
  header: {
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: token.lineWidth,
    paddingBlock: token.paddingSM,
    paddingInline: token.paddingLG,
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    lineHeight: token.lineHeightLG,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginSM,
  },
}));
