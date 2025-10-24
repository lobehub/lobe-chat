import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.paddingSM,
  },

  questionButton: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: 48, // 圆角48px匹配web端
    borderWidth: 1,
    paddingBlock: token.paddingXS,
    paddingInline: token.padding,
  },

  questionText: {
    color: token.colorText,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },

  questionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXS,
  },

  title: {
    color: token.colorTextDescription,
    fontSize: token.fontSize,
    marginBottom: token.margin,
  },
}));
