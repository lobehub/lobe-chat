import { Block, Empty, Text } from '@lobehub/ui-rn';
import React from 'react';
import { Alert } from 'react-native';

export default () => {
  return (
    <Empty description="还没有任何项目">
      <Block
        marginTop={16}
        onPress={() => Alert.alert('提示', '创建新项目')}
        paddingHorizontal={24}
        paddingVertical={12}
        variant="filled"
      >
        <Text>创建项目</Text>
      </Block>
    </Empty>
  );
};
