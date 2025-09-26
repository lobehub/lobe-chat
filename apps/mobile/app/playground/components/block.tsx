import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, ClickableDemo, LayoutDemo } from '@lobehub/ui-rn/Block/demos';
import README from '@lobehub/ui-rn/Block/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

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
