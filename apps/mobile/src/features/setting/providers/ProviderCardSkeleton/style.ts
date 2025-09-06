import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  card: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadius,
    padding: token.paddingSM,
  },
  container: {
    marginHorizontal: token.marginSM,
    marginVertical: token.marginXS,
  },
  description: {
    marginLeft: token.marginLG + token.marginXS,
    marginTop: token.marginXS,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    justifyContent: 'space-between',
  },
}));
