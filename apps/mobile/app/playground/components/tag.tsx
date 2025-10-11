import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import {
  BasicDemo,
  BorderDemo,
  ColorsDemo,
  PresetDemo,
  UseCaseDemo,
} from '@lobehub/ui-rn/Tag/demos';
import README from '@lobehub/ui-rn/Tag/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色样式' },
  { component: <PresetDemo />, key: 'preset', title: '预设颜色' },
  { component: <BorderDemo />, key: 'border', title: '无边框' },
  { component: <UseCaseDemo />, key: 'usecase', title: '实际应用' },
];

export default function TagPlaygroundPage() {
  return (
    <PageContainer showBack title="Tag 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
