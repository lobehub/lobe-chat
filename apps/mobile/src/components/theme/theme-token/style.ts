import { createStyles } from '@/theme';

export const useStyles = createStyles(({ token }) => {
  return {
    scrollView: {
      flex: 1,
    },
    themeToggle: {
      alignItems: 'center',
      backgroundColor: token.colorFillSecondary,
      borderRadius: 20,
      height: token.controlHeight + 8,
      justifyContent: 'center',
      width: token.controlHeight + 8,
    },
    viewModeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: token.marginLG,
      marginHorizontal: token.marginLG,
    },
  };
});
