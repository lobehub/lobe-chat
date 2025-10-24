import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginXXS,
  },

  authorName: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
  },

  date: {
    color: token.colorTextQuaternary,
    fontSize: token.fontSizeSM,
  },
  // Header related styles
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: token.margin,
    paddingInline: token.marginXXS,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: token.margin,
  },
  name: {
    color: token.colorText,
    fontSize: token.fontSizeXL,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXXS,
  },
}));
