import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import { BasicDemo } from '@lobehub/ui-rn/Switch/demos';
import README from '@lobehub/ui-rn/Switch/readme';
import React from 'react';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function SwitchPlaygroundPage() {
  return (
    <PageContainer showBack title="Switch 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
