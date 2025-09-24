import React from 'react';

import { PageContainer } from '@/components';
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
} from '@/components/Input/demos';
import README from '@/components/Input/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PrefixDemo />, key: 'prefix', title: '带前缀' },
  { component: <SuffixDemo />, key: 'suffix', title: '带后缀' },
  { component: <SearchDemo />, key: 'search', title: '搜索输入框' },
  { component: <PasswordDemo />, key: 'password', title: '密码输入框' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <VariantDemo />, key: 'variant', title: '外观变体' },
  { component: <TextAreaDemo />, key: 'textarea', title: '多行文本' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
];

export default function InputPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <PageContainer showBack style={styles.safeAreaView} title="Input 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
