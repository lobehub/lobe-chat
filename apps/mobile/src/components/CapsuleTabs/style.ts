import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flexDirection: 'row',
  },
  tab: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: token.colorBgContainer,
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
