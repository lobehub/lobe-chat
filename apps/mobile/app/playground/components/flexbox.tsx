import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo } from '@lobehub/ui-rn/Flexbox/demos';
import README from '@lobehub/ui-rn/Flexbox/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function FlexboxPlaygroundPage() {
  return (
    <PageContainer showBack title="FlexBox 弹性布局">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
