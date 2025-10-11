import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, ClosableDemo, CustomDemo, TypesDemo } from '@lobehub/ui-rn/Alert/demos';
import README from '@lobehub/ui-rn/Alert/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '语义类型' },
  { component: <ClosableDemo />, key: 'closable', title: '可关闭提示' },
  { component: <CustomDemo />, key: 'custom', title: '自定义内容' },
];

export default function AlertPlaygroundPage() {
  return (
    <PageContainer showBack title="Alert 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
