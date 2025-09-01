import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: token.paddingSM,
    paddingTop: token.paddingXS,
  },
  errorText: {
    color: token.colorError,
    fontSize: token.fontSize,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: token.paddingXL,
  },
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    textAlign: 'center',
  },
  scrollContainer: {
    gap: token.margin,
    paddingBottom: token.marginMD,
  },
}));
