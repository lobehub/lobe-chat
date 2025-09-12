import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, ColorsDemo, UseCaseDemo, BorderDemo, PresetDemo } from '@/components/Tag/demos';
import README from '@/components/Tag/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色样式' },
  { component: <PresetDemo />, key: 'preset', title: '预设颜色' },
  { component: <BorderDemo />, key: 'border', title: '无边框' },
  { component: <UseCaseDemo />, key: 'usecase', title: '实际应用' },
];

export default function TagPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Tag 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
