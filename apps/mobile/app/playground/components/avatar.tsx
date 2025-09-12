import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, SizesDemo, BordersDemo, ErrorDemo } from '@/components/Avatar/demos';
import README from '@/components/Avatar/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <BordersDemo />, key: 'borders', title: '边框样式' },
  { component: <ErrorDemo />, key: 'error', title: '错误处理' },
];

export default function AvatarPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Avatar 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />;
    </SafeAreaView>
  );
}
