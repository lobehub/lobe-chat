import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flexDirection: 'row',
  },
  tab: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: token.colorBgElevated,
  },
  tabText: {
    color: token.colorTextSecondary,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: token.colorText,
  },
}));
