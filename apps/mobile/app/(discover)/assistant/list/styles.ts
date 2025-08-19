import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: token.colorTextSecondary,
    marginTop: 16,
  },
  safeAreaContainer: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  searchInput: {
    color: token.colorText,
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
}));
