import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: token.padding,
  },
  emptyText: {
    color: token.colorTextSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: token.colorError,
  },
  filterContainer: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: token.paddingXS,
    paddingTop: token.padding,
  },
  listContainer: {
    paddingHorizontal: token.padding,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: token.colorTextSecondary,
    marginTop: token.margin,
  },
  searchContainer: {
    marginBottom: token.paddingSM,
    paddingHorizontal: token.paddingSM,
  },
  searchIcon: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  searchInput: {
    color: token.colorText,
    flex: 1,
    fontSize: token.fontSize,
    paddingVertical: token.marginXS,
  },
  subtitle: {
    fontSize: token.fontSizeXL,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.margin,
  },
  title: {
    fontSize: token.fontSizeHeading1,
    fontWeight: token.fontWeightStrong,
  },
}));
