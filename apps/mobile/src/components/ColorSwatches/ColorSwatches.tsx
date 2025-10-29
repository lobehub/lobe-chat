import chroma from 'chroma-js';
import { Check } from 'lucide-react-native';
import { darken, mix, readableColor } from 'polished';
import { memo, useState } from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import Icon from '@/components/Icon';

import ConicGradientPattern from './ConicGradientPatern';
import { useStyles } from './style';
import type { ColorSwatchesProps } from './type';

// 检查是否为透明色
const isTransparent = (color: string) => {
  return color === 'transparent' || chroma(color).alpha() === 0;
};

const ColorSwatches = memo<ColorSwatchesProps>(
  ({
    colors,
    defaultValue,
    enableColorSwatches = true,
    gap = 6,
    onChange,
    shape = 'circle',
    size = 24,
    style,
    value,
    ...rest
  }) => {
    const [activeColor, setActiveColor] = useState(value || defaultValue || 'rgba(0, 0, 0, 0)');
    const { styles, theme } = useStyles({ shape, size });

    // 处理颜色选择
    const handleColorSelect = (color: string | undefined) => {
      setActiveColor(color as any);
      onChange?.(color || '');
    };

    if (!enableColorSwatches) {
      return null;
    }

    return (
      <Flexbox gap={gap} horizontal style={style} wrap={'wrap'} {...rest}>
        {colors.map((colorItem, index) => {
          const color = colorItem.color || theme.colorPrimary;
          const isActive = (!activeColor && !colorItem.color) || color === activeColor;
          const isColorTransparent = isTransparent(color);

          return (
            <Block
              accessibilityRole="button"
              android_ripple={{
                color: darken(0.1, color),
                foreground: true,
              }}
              key={colorItem.key || index}
              onPress={() => handleColorSelect(colorItem.color)}
              pressEffect
              style={({ pressed }) => [
                styles.colorSwatch,
                isActive && styles.activeSwatch,
                {
                  backgroundColor: isColorTransparent
                    ? 'transparent'
                    : pressed
                      ? darken(0.1, color)
                      : color,
                  overflow: 'hidden',
                },
              ]}
            >
              {isColorTransparent && (
                <View style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
                  <ConicGradientPattern
                    fillColor={theme.colorFillSecondary}
                    height={size}
                    width={size}
                  />
                </View>
              )}
              {isActive && (
                <Icon
                  color={
                    color && color !== 'rgba(0, 0, 0, 0)'
                      ? mix(0.5, readableColor(color), color)
                      : undefined
                  }
                  icon={Check}
                  size={{
                    size: 14,
                    strokeWidth: 3,
                  }}
                  style={{
                    position: 'absolute',
                  }}
                />
              )}
            </Block>
          );
        })}
      </Flexbox>
    );
  },
);

ColorSwatches.displayName = 'ColorSwatches';

export default ColorSwatches;
export type { ColorSwatchesItemType, ColorSwatchesProps } from './type';
