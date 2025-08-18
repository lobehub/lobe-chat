import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => {
  const t = token || {
    borderRadius: 6,
    borderRadiusLG: 12,
    fontFamilyCode: 'monospace',
    fontSize: 14,
    fontSizeHeading3: 18,
    fontSizeLG: 16,
    fontSizeSM: 12,
    marginLG: 16,
    marginSM: 8,
    marginXS: 4,
    marginXXS: 2,
    paddingLG: 16,
    paddingMD: 12,
    paddingSM: 8,
  };

  return {
    // 页面布局样式
    header: {
      alignItems: 'center',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: t.paddingLG,
    },
    headerLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    headerTitle: {
      fontSize: t.fontSizeLG,
      fontWeight: '600',
    },

    safeArea: {
      backgroundColor: t.colorBgLayout,
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    searchContainer: {
      backgroundColor: t.colorBgContainer,
      borderRadius: t.borderRadius,
      margin: t.marginLG,
      paddingHorizontal: t.paddingMD,
    },
    searchInput: {
      color: t.colorText,
      fontSize: t.fontSize,
      height: 40,
    },
    themeToggle: {
      alignItems: 'center',
      backgroundColor: t.colorFillSecondary,
      borderRadius: 20,
      cursor: 'pointer',
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
  };
});
