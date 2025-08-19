import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  demoContent: {
    paddingHorizontal: 16,
  },
  demoDivider: {
    backgroundColor: token.colorBorderSecondary,
    height: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  demoScrollView: {
    flex: 1,
  },
  demoSection: {
    marginBottom: 8,
  },
  demoTitle: {
    color: token.colorText,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  header: {
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    padding: 20,
  },
  readmeContainer: {
    padding: 16,
  },
  subtitle: {
    color: token.colorTextSecondary,
    fontSize: 14,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: token.colorBgElevated,
  },
  tabContainer: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: token.colorText,
  },
  tabTextInactive: {
    color: token.colorTextSecondary,
  },
  title: {
    color: token.colorText,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}));
