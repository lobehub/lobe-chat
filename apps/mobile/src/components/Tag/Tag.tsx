import { memo, useMemo } from 'react';

import { useThemeMode } from '@/components/ThemeProvider/context';

import Flexbox from '../Flexbox';
import Icon from '../Icon';
import Text from '../Text';
import { useStyles } from './style';
import type { TagProps } from './type';
import { getTagColorStyles } from './utils';

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
    const { styles } = useStyles();
    const { token, isDarkMode } = useThemeMode();

    // 向后兼容 border prop
    const variant = propVariant || (border === false ? 'borderless' : 'filled');

    // 获取颜色样式
    const appearance = isDarkMode ? 'dark' : 'light';
    const colorStyles = useMemo(
      () => getTagColorStyles(token, appearance, color, variant),
      [token, appearance, color, variant],
    );

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

      return [styles.text, textSizeStyles[size], { color: colorStyles.color }, textStyle];
    }, [styles, size, colorStyles.color, textStyle]);

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
      return iconProps?.color ?? colorStyles.color;
    }, [iconProps?.color, colorStyles.color]);

    // 根据尺寸确定圆角
    const borderRadius = useMemo(() => {
      const radiusMap = {
        large: token.borderRadius,
        medium: token.borderRadiusSM,
        small: token.borderRadiusSM,
      };
      return radiusMap[size];
    }, [token.borderRadius, token.borderRadiusSM, size]);

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
        {
          backgroundColor: colorStyles.backgroundColor,
          borderColor: colorStyles.borderColor,
          borderRadius,
        },
        style,
      ];
    }, [styles.container, sizeStyle, variantStyle, colorStyles, borderRadius, style]);

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
