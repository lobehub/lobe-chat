import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo, WithCoverDemo } from '@lobehub/ui-rn/Card/demos';
import README from '@lobehub/ui-rn/Card/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础卡片' },
  { component: <WithCoverDemo />, key: 'with-cover', title: '带封面卡片' },
];

export default function CardPlaygroundPage() {
  return (
    <PageContainer showBack title="Card 卡片">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
