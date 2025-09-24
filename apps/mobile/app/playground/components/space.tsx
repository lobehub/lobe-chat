import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  AdvancedDemo,
  AlignmentDemo,
  BasicDemo,
  DirectionsDemo,
  SizesDemo,
} from '@/components/Space/demos';
import README from '@/components/Space/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <DirectionsDemo />, key: 'directions', title: '方向' },
  { component: <SizesDemo />, key: 'sizes', title: '间距大小' },
  { component: <AlignmentDemo />, key: 'alignment', title: '对齐方式' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function SpacePlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Space 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
