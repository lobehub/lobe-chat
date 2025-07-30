import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },

  authorName: {
    color: token.colorTextTertiary,
    fontSize: 14,
  },

  date: {
    color: token.colorTextQuaternary,
    fontSize: 14,
  },
  // Header related styles
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  name: {
    color: token.colorText,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}));
