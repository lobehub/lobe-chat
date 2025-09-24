import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginTop: token.marginXS,
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
  },
}));
