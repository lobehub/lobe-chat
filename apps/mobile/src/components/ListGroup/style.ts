import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    marginBottom: token.marginLG,
    overflow: 'hidden',
  },
  title: {
    color: token.colorTextLabel,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: token.marginXS,
    paddingHorizontal: 16,
  },
}));
