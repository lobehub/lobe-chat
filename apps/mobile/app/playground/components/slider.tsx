import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, ControlledDemo, MarksDemo, RangeDemo } from '@/components/Slider/demos';
import README from '@/components/Slider/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <RangeDemo />, key: 'range', title: '不同范围' },
  { component: <ControlledDemo />, key: 'controlled', title: '受控模式' },
  { component: <MarksDemo />, key: 'marks', title: '刻度标记' },
];

export default function SliderPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Slider 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
