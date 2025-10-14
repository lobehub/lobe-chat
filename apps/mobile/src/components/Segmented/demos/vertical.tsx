import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import { Home, Settings, User } from 'lucide-react-native';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">垂直排列 - 默认</Text>
        <Segmented defaultValue="选项 1" options={['选项 1', '选项 2', '选项 3']} vertical />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">垂直排列 - 带图标</Text>
        <Segmented
          defaultValue="home"
          options={[
            { icon: Home, label: '首页', value: 'home' },
            { icon: User, label: '用户', value: 'user' },
            { icon: Settings, label: '设置', value: 'settings' },
          ]}
          vertical
        />
      </Flexbox>
    </Flexbox>
  );
};
