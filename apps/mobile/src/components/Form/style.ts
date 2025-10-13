import { createStyles } from '@/components/theme';

export const useStyles = createStyles(({ token }) => ({
  errorMessage: {
    color: token.colorError,
  },
  extraMessage: {
    color: token.colorTextSecondary,
  },
  form: {
    width: '100%',
  },
  helpMessage: {
    color: token.colorTextDescription,
  },
  itemContainer: {
    marginBottom: token.marginXL,
    width: '100%',
  },
  label: {
    color: token.colorText,
    fontSize: token.fontSize,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXXS,
    paddingBottom: token.paddingXS,
  },
  message: {
    fontSize: token.fontSize,
    marginTop: token.marginXS,
  },
  required: {
    color: token.colorError,
    fontSize: token.fontSize,
  },
}));
