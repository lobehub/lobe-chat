import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/_const/common';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => {
  return {
    // 控制器样式
    controlInput: {
      borderRadius: token.borderRadius,
      borderWidth: 1,
      flex: 1,
      fontSize: token.fontSize,
      height: 40,
      paddingInline: token.paddingMD,
    },
    controlItem: {
      marginBottom: token.marginLG,
    },
    controlLabel: {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      marginBottom: token.marginSM,
    },
    controlRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginSM,
    },
    controlsContainer: {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      margin: token.marginLG,
      padding: token.paddingLG,
    },
    fontSizeLarge: {
      color: token.colorText,
      fontSize: FONT_SIZE_LARGE,
    },
    fontSizeSmall: {
      color: token.colorText,
      fontSize: FONT_SIZE_SMALL,
    },
    fontSizeStandard: {
      color: token.colorText,
      fontSize: FONT_SIZE_STANDARD,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: token.marginSM,
      marginTop: token.marginSM,
    },
  };
});
