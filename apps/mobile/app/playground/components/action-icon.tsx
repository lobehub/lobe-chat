import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  BasicDemo,
  ColorsDemo,
  DisabledDemo,
  LoadingDemo,
  SizesDemo,
  VariantsDemo,
} from '@/components/ActionIcon/demos';
import README from '@/components/ActionIcon/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <VariantsDemo />, key: 'variants', title: '不同视觉风格' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <LoadingDemo />, key: 'loading', title: '加载状态' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
];

export default function ActionIconPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ActionIcon 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
