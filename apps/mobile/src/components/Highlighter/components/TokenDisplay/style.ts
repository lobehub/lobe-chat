import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  codeContainer: {
    alignSelf: 'stretch',
    backgroundColor: token.colorBgContainer,
    borderRadius: 0,
    flexShrink: 1,
    margin: 0,
  },
  codeLine: {
    flexDirection: 'row',
    flexShrink: 0,
    fontFamily: token.fontFamilyCode,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  codeScrollContainer: {
    flexDirection: 'column',
    minWidth: '100%',
    padding: token.paddingSM,
  },
  codeText: {
    flexShrink: 0,
    fontFamily: token.fontFamilyCode,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  errorText: {
    color: token.colorText,
    margin: 8,
  },
  horizontalScrollContent: {
    flexGrow: 1,
  },
}));
