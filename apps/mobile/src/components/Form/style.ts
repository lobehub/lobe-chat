import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => ({
  errorMessage: {
    color: token.colorError,
  },
  extraMessage: {
    color: token.colorTextSecondary,
  },
  form: {
    gap: token.marginMD,
    width: '100%',
  },
  helpMessage: {
    color: token.colorTextDescription,
  },
  itemContainer: {
    width: '100%',
  },
  label: {
    color: token.colorTextDescription,
    fontSize: token.fontSizeSM,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
    marginBottom: token.marginSM,
  },
  message: {
    fontSize: token.fontSizeSM,
    marginTop: token.marginXS,
  },
  required: {
    color: token.colorError,
    fontSize: token.fontSizeSM,
  },
}));
