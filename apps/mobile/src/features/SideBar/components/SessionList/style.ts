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
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    color: token.colorText,
    height: 40,
    marginHorizontal: token.padding,
    marginVertical: token.marginXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  sessionList: {
    flex: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.marginXS,
  },
}));
