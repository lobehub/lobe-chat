import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import {
  AnimatedDemo,
  AvatarDemo,
  BasicDemo,
  ComplexDemo,
  CompoundDemo,
  ParagraphDemo,
} from '@lobehub/ui-rn/Skeleton/demos';
import README from '@lobehub/ui-rn/Skeleton/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AnimatedDemo />, key: 'animated', title: '动画效果' },
  { component: <AvatarDemo />, key: 'avatar', title: '头像骨架屏' },
  { component: <ParagraphDemo />, key: 'paragraph', title: '段落骨架屏' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <ComplexDemo />, key: 'complex', title: '复杂示例' },
];

export default function SkeletonPlaygroundPage() {
  return (
    <PageContainer showBack title="Skeleton 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
