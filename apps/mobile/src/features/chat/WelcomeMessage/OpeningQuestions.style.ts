import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    paddingHorizontal: token.paddingSM,
    paddingVertical: 0,
  },

  questionButton: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: 48, // 圆角48px匹配web端
    borderWidth: 1,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },

  questionText: {
    color: token.colorText,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },

  questionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXS,
  },

  title: {
    color: token.colorTextDescription,
    fontSize: token.fontSize,
    marginBottom: token.marginXS,
  },
}));
