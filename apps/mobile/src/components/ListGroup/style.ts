import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginBottom: token.marginLG,
    overflow: 'hidden',
  },
  title: {
    color: token.colorTextLabel,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXS,
    paddingInline: token.padding,
  },
}));
