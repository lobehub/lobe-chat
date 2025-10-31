import React from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import FlashListScrollShadow from '@/components/FlashListScrollShadow';
import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

interface Item {
  id: string;
  title: string;
}

const data: Item[] = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i}`,
  title: `列表项 ${i + 1}`,
}));

export default () => {
  return (
    <View style={{ height: 400 }}>
      <FlashListScrollShadow
        data={data}
        drawDistance={400}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Block padding={16} variant="borderless">
            <Flexbox align="center" gap={12} horizontal>
              <View
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 20,
                  height: 40,
                  width: 40,
                }}
              />
              <Text>{item.title}</Text>
            </Flexbox>
          </Block>
        )}
      />
    </View>
  );
};
