import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  return {
    // 页面布局样式
    header: {
      alignItems: 'center',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: token.paddingLG,
    },
    headerLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginSM,
    },
    headerTitle: {
      fontSize: token.fontSizeLG,
      fontWeight: '600',
    },
    safeArea: {
      backgroundColor: token.colorBgLayout,
      flex: 1,
    },
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
