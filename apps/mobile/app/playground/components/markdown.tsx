import { PageContainer } from '@lobehub/ui-rn';
import { BasicDemo } from '@lobehub/ui-rn/Markdown/demos';
import README from '@lobehub/ui-rn/Markdown/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function MarkdownPlaygroundPage() {
  return (
    <PageContainer showBack title="Markdown 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
