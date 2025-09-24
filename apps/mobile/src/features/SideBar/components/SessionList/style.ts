import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: token.marginSM,
  },
  headerText: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
  },
  searchInput: {
    marginHorizontal: token.paddingSM,
    marginVertical: token.marginXS,
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: token.paddingSM,
  },
}));
