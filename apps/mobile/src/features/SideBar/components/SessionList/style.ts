import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
    paddingTop: token.paddingSM,
  },
  header: {
    paddingVertical: token.marginSM,
  },
  headerText: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
  },
  searchInput: {
    marginHorizontal: token.padding,
    marginVertical: token.marginXS,
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.marginXS,
  },
}));
