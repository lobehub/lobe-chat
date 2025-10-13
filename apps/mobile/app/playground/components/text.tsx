import { PageContainer } from '@lobehub/ui-rn';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import {
  BasicDemo,
  CombinationDemo,
  EllipsisDemo,
  HeadingDemo,
  SemanticDemo,
  StylingDemo,
} from '@lobehub/ui-rn/Text/demos';
import README from '@lobehub/ui-rn/Text/readme';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <HeadingDemo />, key: 'heading', title: '标题' },
  { component: <SemanticDemo />, key: 'semantic', title: '语义化类型' },
  { component: <StylingDemo />, key: 'styling', title: '自定义样式' },
  { component: <EllipsisDemo />, key: 'ellipsis', title: '省略号' },
  { component: <CombinationDemo />, key: 'combination', title: '组合使用' },
];

export default function TextPlaygroundPage() {
  return (
    <PageContainer showBack title="Text 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
