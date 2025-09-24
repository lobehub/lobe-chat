import React, { memo, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import FlexBox from '../FlexBox';
import { useBlockVariants, useStyles } from './style';
import type { BlockProps } from './type';

const Block = memo<BlockProps>(
  ({
    variant = 'filled',
    shadow = false,
    glass = false,
    clickable = false,
    children,
    style,
    onPress,
    ...rest
  }) => {
    const { styles } = useStyles();
    const blockVariants = useBlockVariants(styles);

    // 生成样式数组
    const variantStyles = blockVariants({ clickable, glass, shadow, variant });

    // 合并自定义样式
    const combinedStyles = useMemo(() => {
      return style ? [...variantStyles, style] : variantStyles;
    }, [variantStyles, style]);

    // 如果是可点击的，使用 TouchableOpacity
    if (clickable && onPress) {
      return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={combinedStyles as any}>
          <FlexBox {...rest}>{children}</FlexBox>
        </TouchableOpacity>
      );
    }

    // 否则使用普通的 View
    return (
      <View style={combinedStyles as any}>
        <FlexBox {...rest}>{children}</FlexBox>
      </View>
    );
  },
);

Block.displayName = 'Block';

export default Block;
