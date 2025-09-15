import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { AdvancedDemo, BasicDemo, PositionDemo, TriggerDemo } from '@/components/Tooltip/demos';
import README from '@/components/Tooltip/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TriggerDemo />, key: 'trigger', title: '触发方式' },
  { component: <PositionDemo />, key: 'position', title: '不同位置' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function TooltipPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Tooltip 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
