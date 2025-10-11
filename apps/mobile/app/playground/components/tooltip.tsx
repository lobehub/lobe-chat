import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import { AdvancedDemo, BasicDemo, PositionDemo, TriggerDemo } from '@lobehub/ui-rn/Tooltip/demos';
import README from '@lobehub/ui-rn/Tooltip/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TriggerDemo />, key: 'trigger', title: '触发方式' },
  { component: <PositionDemo />, key: 'position', title: '不同位置' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function TooltipPlaygroundPage() {
  return (
    <PageContainer showBack title="Tooltip 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
