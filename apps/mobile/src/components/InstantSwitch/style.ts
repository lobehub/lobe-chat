import { createStyles } from '@/theme';

export type InstantSwitchSize = 'small' | 'default' | 'large';

export const useStyles = createStyles(
  (token, { disabled, size }: { disabled: boolean; size: InstantSwitchSize }) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'small': {
          return {
            containerPadding: token.paddingXXS,
            loadingSize: 12,
            switchScale: 0.8,
          };
        }
        case 'large': {
          return {
            containerPadding: token.paddingSM,
            loadingSize: 20,
            switchScale: 1.2,
          };
        }
        default: {
          return {
            containerPadding: token.paddingXS,
            loadingSize: 16,
            switchScale: 1,
          };
        }
      }
    };

    const sizeStyles = getSizeStyles();

    return {
      container: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        minHeight: 31, // 保持固定高度，避免布局跳动
        minWidth: 51, // 保持固定宽度，避免布局跳动
        opacity: disabled ? 0.6 : 1,
        padding: sizeStyles.containerPadding,
      },
      loading: {
        // loading指示器居中显示
      },
      switch: {
        transform: [{ scale: sizeStyles.switchScale }],
      },
    };
  },
);
