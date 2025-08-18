import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  return {
    colorPreview: {
      borderRadius: token.borderRadius,
      borderWidth: 1,
      height: 20,
      width: 20,
    },
    colorValueContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginSM,
    },
    shadowValueContainer: {
      alignItems: 'flex-end',
    },
    tableSubtitle: {
      fontSize: token.fontSize,
      marginBottom: token.marginLG,
    },
    tableTitle: {
      fontSize: token.fontSizeHeading3,
      fontWeight: '600',
      marginBottom: token.marginXS,
    },
    tokenDescription: {
      fontSize: token.fontSizeSM,
      marginTop: token.marginXXS,
    },
    tokenInfo: {
      flex: 1,
      paddingRight: token.paddingMD,
    },
    tokenName: {
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSize,
      fontWeight: '500',
    },
    tokenRow: {
      alignItems: 'flex-start',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: token.paddingMD,
    },
    tokenTable: {
      borderRadius: token.borderRadiusLG,
      margin: token.marginLG,
      marginTop: 0,
      padding: token.paddingLG,
    },
    tokenValue: {
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSizeSM,
    },
    tokenValueContainer: {
      flexShrink: 0,
      maxWidth: '50%',
    },
    tokensContainer: {
      paddingTop: token.paddingMD,
    },
  };
});
