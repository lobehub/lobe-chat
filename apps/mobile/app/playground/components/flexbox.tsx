import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo } from '@/components/Flexbox/demos';
import README from '@/components/Flexbox/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function FlexboxPlaygroundPage() {
  return (
    <PageContainer showBack title="FlexBox 弹性布局">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
