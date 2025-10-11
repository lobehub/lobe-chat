import { PageContainer } from '@lobehub/ui-rn';
import {
  BasicDemo,
  ColorsDemo,
  DisabledDemo,
  LoadingDemo,
  SizesDemo,
  VariantsDemo,
} from '@lobehub/ui-rn/ActionIcon/demos';
import README from '@lobehub/ui-rn/ActionIcon/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <VariantsDemo />, key: 'variants', title: '不同视觉风格' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <LoadingDemo />, key: 'loading', title: '加载状态' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
];

export default function ActionIconPlaygroundPage() {
  return (
    <PageContainer showBack title="ActionIcon 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
