import { createStyles } from '@/theme';

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
    height: token.fontSize,
    marginBottom: token.marginXXS,
  },
  skeletonItem: {
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusXS,
  },
  textContainer: {
    flex: 1,
    marginLeft: token.marginSM,
  },
  textContainerNoAvatar: {
    marginLeft: 0,
  },
  titleLine: {
    height: token.fontSizeLG,
    marginBottom: token.marginXS,
  },
}));
