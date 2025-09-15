import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, FullDemo, TokenDemo } from '@/components/ColorScales/demos';
import README from '@/components/ColorScales/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <FullDemo />, key: 'full', title: '完整色板' },
  { component: <TokenDemo />, key: 'token', title: 'Token 使用' },
];

export default function ColorScalesPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ColorScales 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
