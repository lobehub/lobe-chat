import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  errorText: {
    color: token.colorError,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContainer: {
    gap: 16,
    paddingBottom: 20,
  },
}));
