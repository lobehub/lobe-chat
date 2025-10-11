import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, FullDemo, TokenDemo } from '@lobehub/ui-rn/ColorScales/demos';
import README from '@lobehub/ui-rn/ColorScales/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <FullDemo />, key: 'full', title: '完整色板' },
  { component: <TokenDemo />, key: 'token', title: 'Token 使用' },
];

export default function ColorScalesPlaygroundPage() {
  return (
    <PageContainer showBack title="ColorScales 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
