import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import { BasicDemo, ControlledDemo, MarksDemo, RangeDemo } from '@lobehub/ui-rn/Slider/demos';
import README from '@lobehub/ui-rn/Slider/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <RangeDemo />, key: 'range', title: '不同范围' },
  { component: <ControlledDemo />, key: 'controlled', title: '受控模式' },
  { component: <MarksDemo />, key: 'marks', title: '刻度标记' },
];

export default function SliderPlaygroundPage() {
  return (
    <PageContainer showBack title="Slider 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
