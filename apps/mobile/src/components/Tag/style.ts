import { createStyles } from '@/theme';
import type { PresetColorKey } from '@/theme/interface/presetColors';

export const useStyles = createStyles((token, color?: PresetColorKey) => {
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

    // 根据颜色预设生成样式
    // 使用数字色阶：浅色背景（3）、中等色边框（7）、深色文字（11）
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
      borderColor: colorStyles.borderColor,
      borderRadius: token.borderRadiusSM,
      borderWidth: 1,
      paddingHorizontal: token.paddingXS,
      paddingVertical: token.paddingXXS,
    },
    tagText: {
      color: colorStyles.color,
      fontSize: token.fontSizeSM,
    },
  };
});
