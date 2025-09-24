import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { AdvancedDemo, BasicDemo, PositionDemo, TriggerDemo } from '@/components/Tooltip/demos';
import README from '@/components/Tooltip/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TriggerDemo />, key: 'trigger', title: '触发方式' },
  { component: <PositionDemo />, key: 'position', title: '不同位置' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function TooltipPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Tooltip 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
