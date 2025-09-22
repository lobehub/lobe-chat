import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
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
    marginHorizontal: token.margin,
    marginVertical: token.marginXS,
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.marginXS,
  },
}));
