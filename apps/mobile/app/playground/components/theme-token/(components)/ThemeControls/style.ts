import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  const t = token || {
    borderRadius: 6,
    borderRadiusLG: 12,
    fontSize: 14,
    fontSizeLG: 16,
    marginLG: 16,
    marginSM: 8,
    paddingLG: 16,
    paddingMD: 12,
  };

  return {
    // 控制器样式
    controlInput: {
      borderRadius: t.borderRadius,
      borderWidth: 1,
      flex: 1,
      fontSize: t.fontSize,
      height: 40,
      paddingHorizontal: t.paddingMD,
    },
    controlItem: {
      marginBottom: t.marginLG,
    },
    controlLabel: {
      fontSize: t.fontSizeLG,
      fontWeight: '600',
      marginBottom: t.marginSM,
    },
    controlRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    controlsContainer: {
      backgroundColor: t.colorBgElevated || '#fff',
      borderRadius: t.borderRadiusLG,
      margin: t.marginLG,
      padding: t.paddingLG,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.marginSM,
      marginTop: t.marginSM,
    },
  };
});
