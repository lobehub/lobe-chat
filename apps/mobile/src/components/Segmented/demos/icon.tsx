import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Home,
  Layout,
  List,
  Map,
  Settings,
  User,
} from 'lucide-react-native';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">图标 + 文本</Text>
        <Segmented
          defaultValue="map"
          options={[
            { icon: Map, label: '地图', value: 'map' },
            { icon: List, label: '列表', value: 'list' },
            { icon: Layout, label: '布局', value: 'layout' },
          ]}
        />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">仅图标</Text>
        <Segmented
          defaultValue="left"
          options={[
            { icon: AlignLeft, value: 'left' },
            { icon: AlignCenter, value: 'center' },
            { icon: AlignRight, value: 'right' },
            { icon: AlignJustify, value: 'justify' },
          ]}
        />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">圆角 + 图标</Text>
        <Segmented
          defaultValue="home"
          options={[
            { icon: Home, value: 'home' },
            { disabled: true, icon: User, value: 'user' },
            { icon: Settings, value: 'settings' },
          ]}
          shape="round"
        />
      </Flexbox>
    </Flexbox>
  );
};
