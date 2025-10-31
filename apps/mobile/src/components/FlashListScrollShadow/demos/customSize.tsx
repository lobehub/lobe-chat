import React from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import FlashListScrollShadow from '@/components/FlashListScrollShadow';
import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

interface Item {
  description: string;
  id: string;
  title: string;
}

const data: Item[] = Array.from({ length: 30 }, (_, i) => ({
  description: `这是第 ${i + 1} 项的描述内容`,
  id: `item-${i}`,
  title: `标题 ${i + 1}`,
}));

export default () => {
  return (
    <Flexbox gap={16}>
      <Text as="h4">大阴影区域 (size=60)</Text>
      <View style={{ height: 300 }}>
        <FlashListScrollShadow
          data={data}
          drawDistance={400}
          estimatedItemSize={70}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Block padding={16} variant="borderless">
              <Flexbox gap={4}>
                <Text strong>{item.title}</Text>
                <Text fontSize={12} type="secondary">
                  {item.description}
                </Text>
              </Flexbox>
            </Block>
          )}
          size={60}
        />
      </View>
    </Flexbox>
  );
};
