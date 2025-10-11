import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import {
  AdvancedDemo,
  BasicDemo,
  IntegrationDemo,
  StaticDemo,
  TypesDemo,
} from '@lobehub/ui-rn/Toast/demos';
import README from '@lobehub/ui-rn/Toast/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '类型演示' },
  { component: <StaticDemo />, key: 'static', title: '静态方法' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
  { component: <IntegrationDemo />, key: 'integration', title: '集成示例' },
];

export default function ToastPlaygroundPage() {
  return (
    <PageContainer showBack title="Toast 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
