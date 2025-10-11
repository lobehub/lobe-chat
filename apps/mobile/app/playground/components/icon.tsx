import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, ColorsDemo, SizesDemo, SpinDemo } from '@lobehub/ui-rn/Icon/demos';
import README from '@lobehub/ui-rn/Icon/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <SpinDemo />, key: 'spin', title: '旋转动画' },
];

export default function IconPlaygroundPage() {
  return (
    <PageContainer showBack title="Icon 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
