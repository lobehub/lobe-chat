import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, AdvancedDemo } from '@/components/ColorSwatches/demos';
import README from '@/components/ColorSwatches/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级演示' },
];

export default function ColorSwatchesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ColorSwatches 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
