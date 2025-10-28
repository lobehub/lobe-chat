import { memo } from 'react';
import { ScrollView } from 'react-native';

import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

interface ScrollableTitleProps {
  text: string;
}

/**
 * 横向滚动标题组件
 * 用于在模型选择列表中显示完整的模型名称
 * 支持横向滚动查看长标题，避免省略号截断
 */
const ScrollableTitle = memo<ScrollableTitleProps>(({ text }) => {
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
          <Text fontSize={16}>{text}</Text>
        </Flexbox>
      </ScrollView>
    </Flexbox>
  );
});

ScrollableTitle.displayName = 'ScrollableTitle';

export default ScrollableTitle;
