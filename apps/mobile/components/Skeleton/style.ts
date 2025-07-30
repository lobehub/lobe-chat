import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  paragraphContainer: {
    flexDirection: 'column',
  },
  paragraphLine: {
    height: 14,
    marginBottom: 6,
  },
  skeletonItem: {
    backgroundColor: token.colorFillContent,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  textContainerNoAvatar: {
    marginLeft: 0,
  },
  titleLine: {
    height: 16,
    marginBottom: 8,
  },
}));
