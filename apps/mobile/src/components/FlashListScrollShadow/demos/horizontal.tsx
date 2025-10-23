import React from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import Center from '@/components/Center';
import FlashListScrollShadow from '@/components/FlashListScrollShadow';
import Text from '@/components/Text';

interface Item {
  color: string;
  id: string;
  title: string;
}

const data: Item[] = Array.from({ length: 20 }, (_, i) => ({
  color: `hsl(${(i * 360) / 20}, 70%, 60%)`,
  id: `card-${i}`,
  title: `卡片 ${i + 1}`,
}));

export default () => {
  return (
    <View style={{ height: 200 }}>
      <FlashListScrollShadow
        data={data}
        estimatedItemSize={140}
        keyExtractor={(item) => item.id}
        orientation="horizontal"
        renderItem={({ item }) => (
          <Block padding={12} variant="borderless">
            <Center gap={8} height={150} width={120}>
              <View
                style={{
                  backgroundColor: item.color,
                  borderRadius: 12,
                  height: 100,
                  width: 100,
                }}
              />
              <Text fontSize={12}>{item.title}</Text>
            </Center>
          </Block>
        )}
      />
    </View>
  );
};
