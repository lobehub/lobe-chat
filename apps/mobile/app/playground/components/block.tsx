import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components';
import {
  basic as BasicDemo,
  cva as CVADemo,
  clickable as ClickableDemo,
  compatibilityTest as CompatibilityTestDemo,
  layout as LayoutDemo,
  stylePattern as StylePatternDemo,
  stylish as StylishDemo,
} from '@/components/Block/demos';
import README from '@/components/Block/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ClickableDemo />, key: 'clickable', title: '可点击状态' },
  { component: <LayoutDemo />, key: 'layout', title: '布局示例' },
  { component: <CVADemo />, key: 'cva', title: 'RN CVA 示例' },
  { component: <StylePatternDemo />, key: 'stylePattern', title: 'Style 模式' },
  { component: <StylishDemo />, key: 'stylish', title: 'Stylish 样式' },
  { component: <CompatibilityTestDemo />, key: 'compatibilityTest', title: '兼容性测试' },
];

export default function BlockPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Block 块容器" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
