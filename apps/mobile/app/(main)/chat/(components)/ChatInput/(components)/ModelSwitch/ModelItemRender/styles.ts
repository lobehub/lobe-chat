import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  leftSection: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0, // 允许文字收缩
  },

  modelName: {
    color: token.colorText,
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },

  rightSection: {
    flexShrink: 0,
    marginLeft: 8,
  },
}));
