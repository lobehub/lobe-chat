import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  bottomRow: {
    marginTop: token.marginXXS,
  },
  card: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadius,
    marginVertical: token.marginXS,
    padding: token.paddingSM,
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  modelInfo: {
    flex: 1,
    marginLeft: token.marginSM,
  },
  switchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));
