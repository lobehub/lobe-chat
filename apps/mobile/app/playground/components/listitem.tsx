import { PageContainer } from '@lobehub/ui-rn';
import {
  AdvancedDemo,
  AvatarsDemo,
  BasicDemo,
  NavigationDemo,
} from '@lobehub/ui-rn/ListItem/demos';
import README from '@lobehub/ui-rn/ListItem/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AvatarsDemo />, key: 'avatars', title: '头像类型' },
  { component: <NavigationDemo />, key: 'navigation', title: '导航交互' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function ListItemPlaygroundPage() {
  return (
    <PageContainer showBack title="ListItem 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
