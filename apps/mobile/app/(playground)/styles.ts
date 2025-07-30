import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles(() => ({
  backButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
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
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  componentCard: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
  },
  componentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  componentList: {
    gap: 12,
    padding: 16,
  },
  componentName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTabText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  filterTabs: {
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  headerContent: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
}));
