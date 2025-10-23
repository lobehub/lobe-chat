import React from 'react';
import { View } from 'react-native';

import Block from '@/components/Block';
import FlashListScrollShadow from '@/components/FlashListScrollShadow';
import Text from '@/components/Text';

interface Item {
  id: string;
  title: string;
}

const data: Item[] = Array.from({ length: 10 }, (_, i) => ({
  id: `item-${i}`,
  title: `项目 ${i + 1}`,
}));

export default () => {
  return (
    <View style={{ height: 300 }}>
      <FlashListScrollShadow
        data={data}
        estimatedItemSize={50}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Block padding={16} variant="borderless">
            <Text>{item.title}</Text>
          </Block>
        )}
        visibility="always"
      />
    </View>
  );
};
