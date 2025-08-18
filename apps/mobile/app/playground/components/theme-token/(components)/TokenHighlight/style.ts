import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  return {
    container: {
      borderRadius: token.borderRadiusLG,
      margin: token.marginLG,
      marginTop: 0,
      padding: token.paddingLG,
    },
    highlightContainer: {
      marginTop: token.marginMD,
    },
    highlighter: {
      borderRadius: token.borderRadius,
    },
    subtitle: {
      fontSize: token.fontSize,
      marginBottom: token.marginLG,
    },
    title: {
      fontSize: token.fontSizeHeading3,
      fontWeight: '600',
      marginBottom: token.marginXS,
    },
  };
});
