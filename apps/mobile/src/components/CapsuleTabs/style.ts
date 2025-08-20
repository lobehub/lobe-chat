import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flexDirection: 'row',
  },
  tab: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginRight: token.marginXS,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingXS,
  },
  tabActive: {
    backgroundColor: token.colorPrimary,
  },
  tabText: {
    color: token.colorText,
    fontSize: token.fontSize,
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: token.colorTextLightSolid,
  },
}));
