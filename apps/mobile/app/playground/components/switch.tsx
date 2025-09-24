import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo } from '@/components/Switch/demos';
import README from '@/components/Switch/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function SwitchPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Switch 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
