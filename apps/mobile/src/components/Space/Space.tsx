import { Children, Fragment, memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/styles';

import { useStyles } from './style';
import type { SpaceAlign, SpaceProps, SpaceSize } from './type';

// 将 align 属性映射到 RN 的 alignItems 值
const getAlignStyle = (align: SpaceAlign) => {
  switch (align) {
    case 'start': {
      return 'flex-start';
    }
    case 'end': {
      return 'flex-end';
    }
    case 'center': {
      return 'center';
    }
    case 'baseline': {
      return 'baseline';
    }
    default: {
      return 'flex-start';
    }
  }
};

const Space = memo<SpaceProps>(
  ({
    align = 'center',
    direction = 'horizontal',
    size = 'small',
    wrap = false,
    split,
    children,
    style,
  }) => {
    const token = useTheme();
    const { styles } = useStyles();

    // 将 children 转换为数组
    const childrenArray = Children.toArray(children).filter(
      (child) => child !== null && child !== undefined,
    );

    // 如果没有子元素，则返回 null
    if (childrenArray.length === 0) {
      return null;
    }

    // 将 size 转换为具体的数值
    const getMargin = (size: SpaceSize) => {
      if (typeof size === 'number') {
        return size;
      }
      switch (size) {
        case 'large': {
          return token.marginLG;
        }
        case 'middle': {
          return token.marginMD;
        }
        case 'small': {
          return token.marginXS;
        }
        default: {
          return token.marginXS;
        }
      }
    };

    // 获取水平和垂直间距
    let horizontalMargin = getMargin(Array.isArray(size) ? size[0] : size);

    let verticalMargin = getMargin(Array.isArray(size) ? size[1] || size[0] : size);

    // 生成子元素
    const items = childrenArray.map((child, index) => {
      const isLastItem = index === childrenArray.length - 1;

      // 计算边距样式
      const itemStyle = [
        styles.item,
        direction === 'vertical'
          ? { marginBottom: isLastItem ? 0 : verticalMargin }
          : {
              marginRight: isLastItem ? 0 : horizontalMargin,
              // 当横向并且自动换行时，为每个项增加底部间距，用于行间距
              ...(wrap ? { marginBottom: verticalMargin } : {}),
            },
      ];

      // 处理分隔符
      const splitNode =
        !isLastItem && split ? (
          <View
            style={[
              styles.split,
              direction === 'vertical'
                ? { marginBottom: verticalMargin }
                : { marginRight: horizontalMargin },
            ]}
          >
            {split}
          </View>
        ) : null;

      return (
        <Fragment key={`space-item-${index}`}>
          <View style={itemStyle}>{child}</View>
          {splitNode}
        </Fragment>
      );
    });

    // 计算容器样式
    const spaceStyles = [
      styles.container,
      {
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        flexWrap: wrap && direction === 'horizontal' ? 'wrap' : 'nowrap',
      },
      align && { alignItems: getAlignStyle(align) },
      style,
    ];

    return <View style={spaceStyles}>{items}</View>;
  },
);

Space.displayName = 'Space';

export default Space;
