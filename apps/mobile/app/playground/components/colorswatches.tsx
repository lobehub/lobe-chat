import { PageContainer } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, AdvancedDemo } from '@/components/ColorSwatches/demos';
import README from '@/components/ColorSwatches/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级演示' },
];

export default function ColorSwatchesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="ColorSwatches 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
