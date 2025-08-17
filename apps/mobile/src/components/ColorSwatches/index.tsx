import React, { memo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { useStyles } from './style';
import type { ColorSwatchesProps } from './type';

// 检查是否为透明色
const isTransparent = (color: string) => {
  return color === 'transparent' || color.includes('rgba(0, 0, 0, 0)');
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
    const [activeColor, setActiveColor] = useState(value || defaultValue);
    const { styles, token } = useStyles({ gap, shape, size });

    // 处理颜色选择
    const handleColorSelect = (color: string | undefined) => {
      setActiveColor(color);
      onChange?.(color || '');
    };

    // 计算可读的对比色（用于选中图标）
    const getContrastColor = (bgColor: string) => {
      if (isTransparent(bgColor)) {
        return token.colorText;
      }
      // 简单的对比色计算，实际项目中可以使用更复杂的算法
      return '#ffffff';
    };

    if (!enableColorSwatches) {
      return null;
    }

    return (
      <View style={[styles.container, style]} {...rest}>
        {colors.map((colorItem, index) => {
          const color = colorItem.color || token.colorPrimary;
          const isActive = (!activeColor && !colorItem.color) || color === activeColor;
          const isColorTransparent = isTransparent(color);

          return (
            <TouchableOpacity
              accessibilityLabel={
                typeof colorItem.title === 'string' ? colorItem.title : `Color ${index + 1}`
              }
              accessibilityRole="button"
              activeOpacity={0.8}
              key={colorItem.key || index}
              onPress={() => handleColorSelect(colorItem.color)}
              style={[
                styles.colorSwatch,
                isColorTransparent && styles.transparentSwatch,
                isActive && styles.activeSwatch,
                {
                  backgroundColor: isColorTransparent ? 'transparent' : color,
                },
              ]}
            >
              {isActive && (
                <Check
                  color={getContrastColor(color)}
                  size={14}
                  strokeWidth={3}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
);

ColorSwatches.displayName = 'ColorSwatches';

export default ColorSwatches;
export type { ColorSwatchesItemType, ColorSwatchesProps } from './type';
