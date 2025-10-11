import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, ComparisonDemo, SizesDemo, TypeDemo } from '@lobehub/ui-rn/FluentEmoji/demos';
import README from '@lobehub/ui-rn/FluentEmoji/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ComparisonDemo />, key: 'comparison', title: '3D vs 原始' },
  { component: <TypeDemo />, key: 'type', title: '不同类型' },
];

export default function FluentEmojiPlaygroundPage() {
  return (
    <PageContainer showBack title="FluentEmoji 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
