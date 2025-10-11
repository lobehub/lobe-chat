import { PageContainer } from '@lobehub/ui-rn';
import {
  BasicDemo,
  CompoundDemo,
  PasswordDemo,
  PrefixDemo,
  SearchDemo,
  SizesDemo,
  SuffixDemo,
  TextAreaDemo,
  VariantDemo,
} from '@lobehub/ui-rn/Input/demos';
import README from '@lobehub/ui-rn/Input/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PrefixDemo />, key: 'prefix', title: '带前缀' },
  { component: <SuffixDemo />, key: 'suffix', title: '带后缀' },
  { component: <SearchDemo />, key: 'search', title: '搜索输入框' },
  { component: <PasswordDemo />, key: 'password', title: '密码输入框' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <VariantDemo />, key: 'variant', title: '外观变体' },
  { component: <TextAreaDemo />, key: 'textarea', title: '多行文本（autoSize）' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
];

export default function InputPlaygroundPage() {
  return (
    <PageContainer showBack title="Input 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
