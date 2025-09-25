import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, ClickableDemo, LayoutDemo } from '@/components/Block/demos';
import README from '@/components/Block/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ClickableDemo />, key: 'clickable', title: '可点击状态' },
  { component: <LayoutDemo />, key: 'layout', title: '布局示例' },
];

export default function BlockPlaygroundPage() {
  return (
    <PageContainer showBack title="Block 块容器">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
