import { LoaderCircle } from 'lucide-react-native';
import type { FC } from 'react';
import { memo, useMemo } from 'react';
import { ColorValue, Pressable, PressableProps, ViewStyle } from 'react-native';

import { ICON_SIZE } from '@/_const/common';
import { useTheme } from '@/components/styles';

import Icon, { type IconProps as BaseIconProps, type IconSize } from '../Icon';
import { calcSize, getBaseStyle, getVariantStyle } from './style';

type IconType = BaseIconProps['icon'];

export interface ActionIconProps extends Omit<PressableProps, 'children'> {
  color?: ColorValue;
  disabled?: boolean;
  icon?: IconType;
  loading?: boolean;
  size?: IconSize;
  spin?: boolean;
  variant?: 'borderless' | 'filled' | 'outlined';
}

const ActionIcon: FC<ActionIconProps> = memo(
  ({
    icon,
    loading,
    disabled,
    size = 'middle',
    variant = 'borderless',
    style,
    color,
    spin,
    ...rest
  }) => {
    const token = useTheme();
    const { blockSize, borderRadius, innerIconSize } = useMemo(() => calcSize(size), [size]);

    const baseStyle: ViewStyle = getBaseStyle(blockSize, borderRadius, disabled);

    const variantStyle: ViewStyle = useMemo(
      () => getVariantStyle(variant, token),
      [variant, token],
    );

    const iconColor: ColorValue = color || token.colorText;

    const loaderSize = innerIconSize ?? ICON_SIZE;

    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        style={(state) => [
          baseStyle,
          variantStyle,
          state.pressed && !disabled ? { opacity: 0.7 } : null,
          typeof style === 'function' ? style(state) : style,
        ]}
        {...rest}
      >
        <Icon
          color={iconColor}
          icon={loading ? LoaderCircle : icon}
          size={loaderSize}
          spin={loading ? true : spin}
        />
      </Pressable>
    );
  },
);

ActionIcon.displayName = 'ActionIcon';

export default ActionIcon;
