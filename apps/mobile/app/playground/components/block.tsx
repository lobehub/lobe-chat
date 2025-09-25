import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, ClickableDemo, LayoutDemo, StylePatternDemo } from '@/components/Block/demos';
import README from '@/components/Block/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ClickableDemo />, key: 'clickable', title: '可点击状态' },
  { component: <LayoutDemo />, key: 'layout', title: '布局示例' },
  { component: <StylePatternDemo />, key: 'stylePattern', title: 'Style 模式' },
];

export default function BlockPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Block 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
