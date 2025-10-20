import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: token.paddingSM + token.paddingXS,
    paddingVertical: token.paddingSM,
  },
  headerText: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
  },
  searchInput: {
    borderRadius: 100,
  },
}));
