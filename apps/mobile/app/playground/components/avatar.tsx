import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, BordersDemo, ErrorDemo, SizesDemo } from '@/components/Avatar/demos';
import README from '@/components/Avatar/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <BordersDemo />, key: 'borders', title: '边框样式' },
  { component: <ErrorDemo />, key: 'error', title: '错误处理' },
];

export default function AvatarPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Avatar 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
