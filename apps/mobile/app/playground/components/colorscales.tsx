import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, FullDemo, TokenDemo } from '@/components/ColorScales/demos';
import README from '@/components/ColorScales/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <FullDemo />, key: 'full', title: '完整色板' },
  { component: <TokenDemo />, key: 'token', title: 'Token 使用' },
];

export default function ColorScalesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="ColorScales 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
