import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, IconsDemo, ScrollingDemo, SizesDemo } from '@lobehub/ui-rn/CapsuleTabs/demos';
import README from '@lobehub/ui-rn/CapsuleTabs/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
  { component: <IconsDemo />, key: 'icons', title: '图标组合' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
];

export default function CapsuleTabsPlaygroundPage() {
  return (
    <PageContainer showBack title="CapsuleTabs 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
