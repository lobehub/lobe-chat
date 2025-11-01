import { memo } from 'react';
import { ScrollView } from 'react-native';

import Flexbox from '../Flexbox';
import Text, { type TextProps } from '../Text';

interface ScrollableTitleProps {
  /**
   * 要显示的文本
   */
  text: string;
  /**
   * Text 组件的额外属性
   */
  textProps?: Partial<TextProps>;
}

/**
 * 横向滚动标题组件
 * 用于在列表中显示完整的标题文本
 * 支持横向滚动查看长标题，避免省略号截断
 */
const ScrollableTitle = memo<ScrollableTitleProps>(({ text, textProps }) => {
  return (
    <Flexbox flex={1} style={{ height: 24 }}>
      <ScrollView
        bounces={false}
        directionalLockEnabled={false}
        horizontal
        nestedScrollEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
        }}
      >
        <Flexbox align="center" justify="center" style={{ minHeight: 24, paddingVertical: 2 }}>
          <Text fontSize={16} {...textProps}>
            {text}
          </Text>
        </Flexbox>
      </ScrollView>
    </Flexbox>
  );
});

ScrollableTitle.displayName = 'ScrollableTitle';

export default ScrollableTitle;
