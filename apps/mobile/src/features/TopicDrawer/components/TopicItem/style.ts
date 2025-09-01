import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  activeContainer: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimary,
    borderWidth: token.lineWidth,
  },

  activeTitle: {
    color: token.colorText,
  },

  container: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    marginHorizontal: token.marginSM,
    marginVertical: token.marginXXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: 10,
  },

  content: {
    flex: 1,
  },

  title: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    lineHeight: token.lineHeightSM,
  },
}));
