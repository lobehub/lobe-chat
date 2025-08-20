import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: token.marginLG,
  },
  demoContent: {
    paddingHorizontal: token.paddingLG,
  },
  demoDivider: {
    backgroundColor: token.colorBorderSecondary,
    height: token.lineWidth,
    marginBottom: token.marginLG,
    marginHorizontal: token.marginLG,
    marginTop: token.marginXL,
  },
  demoScrollView: {
    flex: 1,
  },
  demoSection: {
    marginBottom: token.marginXS,
  },
  demoTitle: {
    color: token.colorText,
    fontSize: token.fontSizeHeading3,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginSM,
    marginHorizontal: token.marginLG,
  },
  header: {
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: token.lineWidth,
    padding: token.paddingLG,
  },
  readmeContainer: {
    padding: token.paddingLG,
  },
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
  },
  tab: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXXS,
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  tabActive: {
    backgroundColor: token.colorBgElevated,
  },
  tabContainer: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadiusLG,
    flexDirection: 'row',
    marginHorizontal: token.marginLG,
    marginTop: token.marginLG,
    padding: token.paddingXXS,
  },
  tabText: {
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
  tabTextActive: {
    color: token.colorText,
  },
  tabTextInactive: {
    color: token.colorTextSecondary,
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSizeHeading3,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXXS,
  },
}));
