import { memo, useMemo } from 'react';

import Flexbox from '../Flexbox';
import Icon from '../Icon';
import Text from '../Text';
import { useStyles } from './style';
import type { TagProps } from './type';
import { colorsPreset, colorsPresetSystem, presetColors, presetSystemColors } from './utils';

export const Tag = memo<TagProps>(
  ({
    children,
    color,
    variant: propVariant,
    size = 'medium',
    onPress,
    icon,
    style,
    textStyle,
    iconSize,
    iconProps,
    border, // 已废弃，用于向后兼容
    textProps,
  }) => {
    const { styles, theme } = useStyles();

    // 向后兼容 border prop
    const variant = propVariant || (border === false ? 'borderless' : 'filled');

    // 计算颜色样式
    const colors = useMemo(() => {
      let textColor = theme.colorTextSecondary;
      let backgroundColor;
      let borderColor;
      const isBorderless = variant === 'borderless';
      const isFilled = variant === 'filled';
      const isPresetColor = color && presetColors.includes(color);
      const isPresetSystemColors = color && presetSystemColors.has(color);
      const isHexColor = color && color.startsWith('#');

      if (isPresetColor) {
        textColor = colorsPreset(theme, color);
        backgroundColor = isBorderless ? 'transparent' : colorsPreset(theme, color, 'fillTertiary');
        borderColor = colorsPreset(theme, color, isFilled ? 'fillQuaternary' : 'fillTertiary');
      }
      if (isPresetSystemColors) {
        textColor = colorsPresetSystem(theme, color);
        backgroundColor = isBorderless
          ? 'transparent'
          : colorsPresetSystem(theme, color, 'fillTertiary');
        borderColor = colorsPresetSystem(
          theme,
          color,
          isFilled ? 'fillQuaternary' : 'fillTertiary',
        );
      }
      if (isHexColor) {
        textColor = theme.colorBgLayout;
        backgroundColor = isBorderless ? 'transparent' : color;
      }

      return {
        backgroundColor,
        borderColor,
        textColor,
      };
    }, [color, theme, variant]);

    // 尺寸样式映射
    const sizeStyle = useMemo(() => {
      const sizeMap = {
        large: styles.large,
        medium: styles.medium,
        small: styles.small,
      };
      return sizeMap[size];
    }, [styles, size]);

    // 文本样式
    const textStyles = useMemo(() => {
      const textSizeStyles = {
        large: styles.textLarge,
        medium: null,
        small: styles.textSmall,
      };

      return [styles.text, textSizeStyles[size], { color: colors.textColor }, textStyle];
    }, [styles, size, colors.textColor, textStyle]);

    // Icon 默认尺寸和颜色
    const defaultIconSize = useMemo(() => {
      const sizeMap = {
        large: 16,
        medium: 14,
        small: 12,
      };
      return iconSize ?? sizeMap[size];
    }, [iconSize, size]);

    const iconColor = useMemo(() => {
      return iconProps?.color ?? colors.textColor;
    }, [iconProps?.color, colors.textColor]);

    // 获取 variant 样式
    const variantStyle = useMemo(() => {
      const variantMap = {
        borderless: styles.borderless,
        filled: styles.filled,
        outlined: styles.outlined,
      };
      return variantMap[variant];
    }, [styles, variant]);

    // 容器样式 - 包含尺寸、颜色和 variant
    const containerStyle = useMemo(() => {
      return [
        styles.container,
        sizeStyle,
        variantStyle,
        // 只在有 color 时才覆盖样式中的默认颜色
        colors.backgroundColor && { backgroundColor: colors.backgroundColor },
        colors.borderColor && { borderColor: colors.borderColor },
        style,
      ];
    }, [styles.container, sizeStyle, variantStyle, colors, style]);

    return (
      <Flexbox
        align="center"
        flex={0}
        horizontal
        justify="flex-start"
        onPress={onPress}
        style={containerStyle}
      >
        {icon && <Icon color={iconColor} icon={icon} size={defaultIconSize} {...iconProps} />}
        {typeof children === 'string' ? (
          <Text style={textStyles} {...textProps}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Flexbox>
    );
  },
);

Tag.displayName = 'Tag';

export default Tag;
