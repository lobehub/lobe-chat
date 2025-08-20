import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  return {
    // 控制器样式
    controlInput: {
      borderRadius: token.borderRadius,
      borderWidth: 1,
      flex: 1,
      fontSize: token.fontSize,
      height: 40,
      paddingHorizontal: token.paddingMD,
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
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: token.marginSM,
      marginTop: token.marginSM,
    },
  };
});
