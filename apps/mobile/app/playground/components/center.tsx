import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo } from '@lobehub/ui-rn/Center/demos';
import README from '@lobehub/ui-rn/Center/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function CenterPlaygroundPage() {
  return (
    <PageContainer showBack title="Center 居中组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
