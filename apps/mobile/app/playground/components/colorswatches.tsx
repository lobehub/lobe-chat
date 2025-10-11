import { PageContainer } from '@lobehub/ui-rn';
import { AdvancedDemo, BasicDemo } from '@lobehub/ui-rn/ColorSwatches/demos';
import README from '@lobehub/ui-rn/ColorSwatches/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级演示' },
];

export default function ColorSwatchesPlaygroundPage() {
  return (
    <PageContainer showBack title="ColorSwatches 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
