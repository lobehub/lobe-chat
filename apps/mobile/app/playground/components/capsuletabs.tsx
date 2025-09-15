import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, ScrollingDemo, CategoriesDemo } from '@/components/CapsuleTabs/demos';
import README from '@/components/CapsuleTabs/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
  { component: <CategoriesDemo />, key: 'categories', title: '实际应用场景' },
];

export default function CapsuleTabsPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="CapsuleTabs 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
