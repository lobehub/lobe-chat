import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => {
  return {
    colorPreview: {
      borderColor: token.colorBorderSecondary,
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

    searchInput: {
      marginVertical: token.marginLG,
      paddingInline: token.paddingMD,
    },
    searchInputPlaceholder: {
      color: token.colorTextPlaceholder,
    },
    shadowValueContainer: {
      alignItems: 'flex-end',
    },
    tableSubtitle: {
      color: token.colorTextSecondary,
      fontSize: token.fontSize,
      marginBottom: token.marginLG,
    },
    tableTitle: {
      color: token.colorText,
      fontSize: token.fontSizeHeading3,
      fontWeight: '600',
      marginBottom: token.marginXS,
    },
    tokenDescription: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      marginTop: token.marginXXS,
    },
    tokenInfo: {
      flex: 1,
      paddingRight: token.paddingMD,
    },
    tokenName: {
      color: token.colorText,
      fontFamily: token.fontFamilyCode,
      fontSize: token.fontSize,
      fontWeight: token.fontWeightStrong,
    },
    tokenRow: {
      alignItems: 'flex-start',
      borderBottomColor: token.colorBorderSecondary,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBlock: token.paddingMD,
    },
    tokenTable: {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      margin: token.marginLG,
      marginTop: 0,
      padding: token.paddingLG,
    },
    tokenValue: {
      color: token.colorText,
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
