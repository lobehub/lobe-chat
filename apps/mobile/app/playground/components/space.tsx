import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  BasicDemo,
  DirectionsDemo,
  SizesDemo,
  AlignmentDemo,
  AdvancedDemo,
} from '@/components/Space/demos';
import README from '@/components/Space/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <DirectionsDemo />, key: 'directions', title: '方向' },
  { component: <SizesDemo />, key: 'sizes', title: '间距大小' },
  { component: <AlignmentDemo />, key: 'alignment', title: '对齐方式' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function SpacePlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Space 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
