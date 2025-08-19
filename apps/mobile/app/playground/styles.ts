import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  backButton: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    height: token.controlHeight,
    justifyContent: 'center',
    marginRight: token.marginSM,
    width: token.controlHeight,
  },
  badge: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
  },
  badgeText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeIcon,
    fontWeight: token.fontWeightStrong,
  },
  badges: {
    flexDirection: 'row',
    gap: token.marginXS,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.marginXS,
  },
  categoryText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
    textTransform: 'capitalize',
  },
  componentCard: {
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    elevation: 2,
    marginBottom: token.marginSM,
    padding: token.padding,
  },
  componentDescription: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight * token.fontSize,
    marginBottom: token.marginSM,
  },
  componentList: {
    gap: token.marginSM,
    padding: token.padding,
  },
  componentName: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSizeHeading4,
    fontWeight: token.fontWeightStrong,
  },
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  filterTab: {
    borderRadius: token.borderRadius,
    marginRight: token.marginXS,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
  filterTabText: {
    fontSize: token.fontSize,
    textTransform: 'capitalize',
  },
  filterTabs: {
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    padding: token.paddingLG,
  },
  headerContent: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusSM,
    flexDirection: 'row',
    marginBottom: token.marginSM,
    paddingHorizontal: token.paddingSM,
  },
  searchIcon: {
    marginRight: token.marginXS,
  },
  searchInput: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    paddingVertical: token.paddingXS,
  },
  subtitle: {
    fontSize: token.fontSize,
  },
  tag: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
  },
  tagText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeIcon,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap: token.marginXS,
    marginBottom: token.marginXS,
  },
  title: {
    fontSize: token.fontSizeHeading2,
    fontWeight: 'bold',
    lineHeight: token.lineHeightHeading2 * token.fontSizeHeading2,
  },
}));
