import { createStyles } from '@/theme';
import type { TagColor } from './type';

export const useStyles = createStyles((token, color?: TagColor, border: boolean = true) => {
  // 如果指定了颜色，使用颜色预设；否则使用默认样式
  const getColorStyles = () => {
    if (!color || typeof color !== 'string') {
      // 默认样式
      return {
        backgroundColor: token.colorFillTertiary,
        borderColor: token.colorBorderSecondary,
        color: token.colorText,
      };
    }

    // 处理语义状态颜色
    const statusColorMap: Record<
      string,
      () => { backgroundColor: string; borderColor: string; color: string }
    > = {
      default: () => ({
        backgroundColor: token.colorFillTertiary,
        borderColor: token.colorBorderSecondary,
        color: token.colorText,
      }),
      error: () => ({
        backgroundColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
        color: token.colorErrorText,
      }),
      processing: () => ({
        backgroundColor: token.colorInfoBg,
        borderColor: token.colorInfoBorder,
        color: token.colorInfoText,
      }),
      success: () => ({
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        color: token.colorSuccessText,
      }),
      warning: () => ({
        backgroundColor: token.colorWarningBg,
        borderColor: token.colorWarningBorder,
        color: token.colorWarningText,
      }),
    };

    // 如果是语义状态颜色，使用对应的语义色彩
    if (statusColorMap[color]) {
      return statusColorMap[color]();
    }

    // 否则使用数字色阶的预设颜色：浅色背景（3）、中等色边框（7）、深色文字（11）
    const bgColorKey = `${color}3` as keyof typeof token;
    const borderColorKey = `${color}7` as keyof typeof token;
    const textColorKey = `${color}11` as keyof typeof token;

    return {
      backgroundColor: (token[bgColorKey] as string) || token.colorFillTertiary,
      borderColor: (token[borderColorKey] as string) || token.colorBorderSecondary,
      color: (token[textColorKey] as string) || token.colorText,
    };
  };

  const colorStyles = getColorStyles();

  return {
    tag: {
      backgroundColor: colorStyles.backgroundColor,
      borderColor: border ? colorStyles.borderColor : 'transparent',
      borderRadius: token.borderRadiusSM,
      borderWidth: border ? 1 : 0,
      paddingHorizontal: token.paddingXS,
      paddingVertical: token.paddingXXS,
    },
    tagText: {
      color: colorStyles.color,
      fontSize: token.fontSizeSM,
    },
  };
});
