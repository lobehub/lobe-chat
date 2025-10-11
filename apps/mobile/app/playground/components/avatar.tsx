import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, BordersDemo, ErrorDemo, SizesDemo } from '@lobehub/ui-rn/Avatar/demos';
import README from '@lobehub/ui-rn/Avatar/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <BordersDemo />, key: 'borders', title: '边框样式' },
  { component: <ErrorDemo />, key: 'error', title: '错误处理' },
];

export default function AvatarPlaygroundPage() {
  return (
    <PageContainer showBack title="Avatar 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
