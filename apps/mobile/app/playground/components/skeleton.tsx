import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  AnimatedDemo,
  AvatarDemo,
  BasicDemo,
  ComplexDemo,
  CompoundDemo,
  ParagraphDemo,
} from '@/components/Skeleton/demos';
import README from '@/components/Skeleton/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AnimatedDemo />, key: 'animated', title: '动画效果' },
  { component: <AvatarDemo />, key: 'avatar', title: '头像骨架屏' },
  { component: <ParagraphDemo />, key: 'paragraph', title: '段落骨架屏' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <ComplexDemo />, key: 'complex', title: '复杂示例' },
];

export default function SkeletonPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Skeleton 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
