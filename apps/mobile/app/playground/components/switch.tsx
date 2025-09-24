import { PageContainer } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo } from '@/components/Switch/demos';
import README from '@/components/Switch/readme';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function SwitchPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Switch 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
