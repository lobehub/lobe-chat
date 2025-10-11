import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, SizesDemo, StatesDemo } from '@lobehub/ui-rn/InstantSwitch/demos';
import README from '@lobehub/ui-rn/InstantSwitch/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <StatesDemo />, key: 'states', title: '状态演示' },
];

export default function InstantSwitchPlaygroundPage() {
  return (
    <PageContainer showBack title="InstantSwitch 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
