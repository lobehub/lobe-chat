import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, ComparisonDemo, SizesDemo, TypeDemo } from '@/components/FluentEmoji/demos';
import README from '@/components/FluentEmoji/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ComparisonDemo />, key: 'comparison', title: '3D vs 原始' },
  { component: <TypeDemo />, key: 'type', title: '不同类型' },
];

export default function FluentEmojiPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="FluentEmoji 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
