import { createStyles } from '@/theme';

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
    paddingHorizontal: token.paddingMD,
  },
}));
