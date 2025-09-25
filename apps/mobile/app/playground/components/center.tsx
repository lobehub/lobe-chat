import React from 'react';

import { PageContainer } from '@/components';
import { advanced as AdvancedDemo, basic as BasicDemo } from '@/components/Center/demos';
import README from '@/components/Center/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级用法' },
];

export default function CenterPlaygroundPage() {
  return (
    <PageContainer showBack title="Center 居中组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
