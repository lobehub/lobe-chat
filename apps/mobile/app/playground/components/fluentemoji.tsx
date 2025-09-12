import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, SizesDemo, ComparisonDemo, TypeDemo } from '@/components/FluentEmoji/demos';
import README from '@/components/FluentEmoji/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ComparisonDemo />, key: 'comparison', title: '3D vs 原始' },
  { component: <TypeDemo />, key: 'type', title: '不同类型' },
];

export default function FluentEmojiPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="FluentEmoji 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
