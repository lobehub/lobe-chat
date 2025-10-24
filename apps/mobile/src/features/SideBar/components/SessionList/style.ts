import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingBlock: token.paddingSM,
    paddingInline: token.paddingSM + token.paddingXS,
  },
  headerText: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
  },
  searchInput: {
    borderRadius: 100,
  },
}));
