import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, ColorsDemo, SizesDemo, SpinDemo } from '@/components/Icon/demos';
import README from '@/components/Icon/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <SpinDemo />, key: 'spin', title: '旋转动画' },
];

export default function IconPlaygroundPage() {
  const { styles } = useStyles();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Icon 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
