import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';
import { Header } from '@/components';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  BasicDemo,
  PrefixDemo,
  SuffixDemo,
  SearchDemo,
  PasswordDemo,
  CompoundDemo,
  VariantDemo,
  SizesDemo,
} from '@/components/TextInput/demos';
import README from '@/components/TextInput/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PrefixDemo />, key: 'prefix', title: '带前缀' },
  { component: <SuffixDemo />, key: 'suffix', title: '带后缀' },
  { component: <SearchDemo />, key: 'search', title: '搜索输入框' },
  { component: <PasswordDemo />, key: 'password', title: '密码输入框' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <VariantDemo />, key: 'variant', title: '外观变体' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
];

export default function TextInputPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="TextInput 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
